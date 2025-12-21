import { Injectable } from '@nestjs/common';
import { VectorizeFilesEvent } from './dto/vectorize.dto';
import {
  extractLocalDocuments,
  extractWithUnstructured,
} from 'libs/extract-text';
import { prisma } from 'libs/prisma';
import { Chunk } from '@prisma/client';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { logger } from 'libs/logger';
import { Document as LangchainDocument } from '@langchain/core/documents';
import { PineconeService } from 'src/pinecone/pinecone.service';
import type { Index } from '@pinecone-database/pinecone';

@Injectable()
export class VectorizeService {
  private splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 100,
    separators: ['\n\n', '\n', '. ', ' ', ''],
    keepSeparator: true,
  });

  private index: Index;

  constructor(private readonly pineconeService: PineconeService) {
    this.index = this.pineconeService.index('better-exams');
  }

  // Minimum average words per page to consider extraction successful
  private readonly MIN_WORDS_PER_PAGE = 20;

  async processFiles(event: VectorizeFilesEvent) {
    const { files, userId } = event;

    for (const file of files) {
      let buffer: Buffer;
      if (typeof file.fileBuffer === 'string') {
        buffer = Buffer.from(file.fileBuffer, 'base64');
      } else {
        buffer = file.fileBuffer;
      }

      try {
        const localResult = await extractLocalDocuments(
          buffer,
          file.mimeType,
          file.documentId,
        );

        const shouldUseUnstructured = this.shouldFallbackToUnstructured(
          localResult.documents,
        );

        let finalDocuments: LangchainDocument[] = [];

        if (shouldUseUnstructured) {
          console.log(
            `Local extraction insufficient, using Unstructured API for: ${file.originalName}`,
          );

          // 3. Fallback to Unstructured API
          const unstructuredDocs = await extractWithUnstructured(
            buffer,
            file.mimeType,
            file.originalName,
            file.documentId,
          );

          if (unstructuredDocs.length > 0) {
            finalDocuments = unstructuredDocs;
            console.log(
              `✅ Unstructured API extracted ${unstructuredDocs.length} elements`,
            );
          } else {
            console.warn(
              `❌ Both local and Unstructured extraction failed for: ${file.originalName}`,
            );
            continue;
          }
        } else {
          finalDocuments = localResult.documents;
        }

        // 4. Split documents into chunks
        const allChunks: LangchainDocument[] = [];
        for (const doc of finalDocuments) {
          const chunks = await this.splitter.splitDocuments([doc]);
          allChunks.push(...chunks);
        }

        if (allChunks.length === 0) {
          continue;
        }

        // 5. Save to database with metadata
        const savedChunks = await this.saveChunksToDB(
          file.documentId,
          allChunks,
        );

        // 6. Upsert to Pinecone with metadata
        await this.upsertChunks(savedChunks, userId);

        logger.info(
          `✅ Successfully processed ${file.originalName}: ${allChunks.length} chunks`,
        );
      } catch (error) {
        console.error(`❌ Error processing file ${file.originalName}:`, error);
        logger.error(`Failed to process file ${file.originalName}`, {
          error,
          documentId: file.documentId,
        });
      }
    }
    return true;
  }

  async simpleVectorSearch(query: string, userId: string) {
    const namespace = this.index.namespace(userId);
    const response = await namespace.searchRecords({
      query: {
        topK: 12,
        inputs: { text: query },
      },
      fields: [
        'text',
        'chapter',
        'chapterNumber',
        'chunkIndex',
        'documentId',
        'page',
      ],
    });
    return response;
  }
  private shouldFallbackToUnstructured(
    localDocs: LangchainDocument[],
  ): boolean {
    if (localDocs.length === 0) {
      console.log(`📝 No documents extracted locally`);
      return true;
    }

    // Calculate pages and words
    const uniquePages = new Set<number>();
    let totalWords = 0;

    for (const doc of localDocs) {
      const text = doc.pageContent;
      const words = text.split(/\s+/).filter((w) => w.length > 0).length;
      totalWords += words;

      // Track page numbers
      if (doc.metadata.page !== undefined && doc.metadata.page !== null) {
        uniquePages.add(doc.metadata.page as number);
      }
    }

    const pageCount = uniquePages.size || 1; // Avoid division by zero
    const avgWordsPerPage = totalWords / pageCount;

    console.log(`📊 Extraction stats:`, {
      documents: localDocs.length,
      pages: pageCount,
      totalWords,
      avgWordsPerPage: avgWordsPerPage.toFixed(1),
      minRequired: this.MIN_WORDS_PER_PAGE,
    });
    return avgWordsPerPage < this.MIN_WORDS_PER_PAGE;
  }

  private async saveChunksToDB(
    documentId: string,
    chunks: LangchainDocument[],
  ) {
    const chunkData = chunks.map((chunk, index) => ({
      documentId,
      content: chunk.pageContent,
      index,
      page: chunk.metadata.page as number | undefined,
      chapter: chunk.metadata.chapter as string | undefined,
      chapterNumber: chunk.metadata.chapterNumber as number | undefined,
    }));

    return prisma.chunk.createManyAndReturn({
      data: chunkData,
    });
  }

  private async upsertChunks(chunks: Chunk[], userId: string) {
    const records = chunks.map((chunk) => ({
      _id: chunk.id,
      text: chunk.content,
      documentId: chunk.documentId,
      userId: userId,
      chunkIndex: chunk.index,
      page: chunk.page || 0,
      chapter: chunk.chapter || '',
      chapterNumber: chunk.chapterNumber || 0,
    }));

    try {
      const namespace = this.index.namespace(userId);

      // Upsert in batches of 96 (max for text records)
      const batchSize = 96;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await namespace.upsertRecords(batch);
        console.log(
          `Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`,
        );
      }
      logger.info(`Uploaded ${records.length} chunks to Pinecone.`);
    } catch (error) {
      logger.error('❌ Pinecone upsert error:', error);
      throw error;
    }
  }
}
