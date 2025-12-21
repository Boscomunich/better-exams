import axios from 'axios';
import FormData from 'form-data';
import { Document } from '@langchain/core/documents';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

const CHAPTER_REGEX = /^(Chapter\s+\d+|Section\s+\d+|\d+\s+[A-Z][A-Za-z\s]+)$/i;

interface ChapterState {
  title: string | undefined;
  number: number | undefined;
}

/**
 * The "State Machine" Engine.
 * It iterates through documents (pages or paragraphs), detects headers,
 * and stamps the correct metadata onto them. This ensures context carries over.
 */
function enrichDocumentsWithState(
  docs: Document[],
  documentId: string,
): Document[] {
  let currentChapter: ChapterState = { title: undefined, number: undefined };
  const enrichedDocs: Document[] = [];

  for (const doc of docs) {
    // 1. Split content by lines to check for headers inside the chunk
    const lines = doc.pageContent.split('\n');

    // Iterate through lines to update the current chapter state
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check if this line is a Chapter Header
      // We limit check to short lines (headings) to avoid false positives in long paragraphs
      if (trimmedLine.length < 100) {
        const match = trimmedLine.match(CHAPTER_REGEX);
        if (match) {
          const fullMatch = match[0];
          let chapterNumber: number | undefined;
          let chapterTitle: string | undefined;

          // Check which pattern matched
          if (
            fullMatch.startsWith('Chapter') ||
            fullMatch.startsWith('Section')
          ) {
            // Pattern: "Chapter 3" or "Section 5"
            const numMatch = fullMatch.match(/\d+/);
            if (numMatch) {
              chapterNumber = parseInt(numMatch[0]);
              chapterTitle = fullMatch; // Keep full string as title
            }
          } else {
            // Pattern: "3 PRACTICE OF CURIOSITY IN THE LEARNING OF INDUSTRIAL DESIGN"
            const parts = fullMatch.match(/^(\d+)\s+(.+)$/);
            if (parts) {
              chapterNumber = parseInt(parts[1]);
              chapterTitle = parts[2].trim();
            }
          }

          if (chapterNumber !== undefined) {
            // Clean up the chapter title if we have one
            if (chapterTitle) {
              chapterTitle = chapterTitle
                .replace(/\t/g, ' ') // Replace tabs with spaces
                .replace(/\s+/g, ' ') // Normalize multiple spaces
                .replace(/^Chapter\s+\d+\s*[:\.]?\s*/i, '') // Remove "Chapter X: " prefix
                .replace(/^Section\s+\d+\s*[:\.]?\s*/i, '') // Remove "Section X: " prefix
                .replace(/^\d+\s+/, '') // Remove number prefix like "3"
                .trim();
            }

            currentChapter = {
              number: chapterNumber,
              title: chapterTitle,
            };
          }
        }
      }
    }

    // 2. Create clean metadata with only what we need
    const cleanMetadata: Record<string, any> = {
      documentId,
      page:
        (doc.metadata.loc?.pageNumber as number) ??
        (doc.metadata.page as number) ??
        undefined,
    };

    // Only add chapter if we have one
    if (currentChapter.title) {
      cleanMetadata.chapter = currentChapter.title;
    }

    // Only add chapterNumber if we have one
    if (currentChapter.number !== undefined) {
      cleanMetadata.chapterNumber = currentChapter.number; // Just the number
    }

    // Create new document with clean metadata
    enrichedDocs.push(
      new Document({
        pageContent: doc.pageContent,
        metadata: cleanMetadata,
      }),
    );
  }

  return enrichedDocs;
}

/**
 * Extracts documents from local file buffers using appropriate LangChain loaders
 * and enriches them with chapter and page metadata.
 */
export async function extractLocalDocuments(
  buffer: Buffer,
  mime: string,
  documentId: string,
): Promise<{ documents: Document[] }> {
  let tempPath: string | null = null;
  const tempDir = os.tmpdir();

  try {
    let rawDocs: Document[] = [];

    // Determine the file extension for the temporary file
    const ext =
      mime === 'application/pdf'
        ? '.pdf'
        : mime.includes('presentation')
          ? '.pptx'
          : mime.includes('wordprocessingml') || mime.includes('msword')
            ? '.docx'
            : '.txt'; // Default to text for others

    // 1. Write Buffer to Temp File (Loaders require file paths)
    tempPath = path.join(tempDir, `upload-${documentId}-${Date.now()}${ext}`);
    await fs.writeFile(tempPath, buffer);

    // 2. Select the Modern LangChain Loader
    if (mime === 'application/pdf') {
      const loader = new PDFLoader(tempPath, { splitPages: true });
      rawDocs = await loader.load();
    } else if (mime.includes('presentation')) {
      const loader = new PPTXLoader(tempPath);
      rawDocs = await loader.load();
    } else if (mime.includes('wordprocessingml') || mime.includes('msword')) {
      const loader = new DocxLoader(tempPath, { type: 'docx' });
      rawDocs = await loader.load();

      // OPTIMIZATION: If DOCX returns one giant document, split it by paragraphs
      if (rawDocs.length === 1) {
        const fullText = rawDocs[0].pageContent;
        rawDocs = fullText
          .split(/\n\s*\n/)
          .filter((para) => para.trim().length > 0)
          .map((para) => new Document({ pageContent: para }));
      }
    } else {
      // Fallback for plain text
      const text = buffer.toString('utf-8');
      rawDocs = [new Document({ pageContent: text })];
    }

    // 3. Process Metadata (State Machine) - creates clean metadata
    const finalDocs = enrichDocumentsWithState(rawDocs, documentId);

    return { documents: finalDocs };
  } catch (error) {
    // Robust Error Logging
    console.error(
      `Error processing document ID ${documentId} (MIME: ${mime}):`,
      error,
    );
    return { documents: [] };
  } finally {
    // 4. Cleanup
    if (tempPath) {
      try {
        await fs.unlink(tempPath);
      } catch (cleanupError) {
        console.log(
          `Warning: Failed to delete temporary file at ${tempPath}.`,
          cleanupError,
        );
      }
    }
  }
}

// Interface for Unstructured.io elements
interface UnstructuredElement {
  text?: string;
  type?: string;
  metadata?: {
    page_number?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Extracts document elements using the external Unstructured.io API.
 */
export async function extractWithUnstructured(
  buffer: Buffer,
  mime: string,
  filename: string,
  documentId: string,
): Promise<Document[]> {
  try {
    const form = new FormData();
    form.append('files', buffer, { filename, contentType: mime });

    const response = await axios.post(
      'https://api.unstructured.io/general/v0/general',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'UNSTRUCTURED-API-KEY': process.env.UNSTRUCTURED_API_KEY!,
        },
      },
    );

    const elements: UnstructuredElement[] = response.data;
    if (!Array.isArray(elements)) {
      console.error('Unstructured API returned a non-array response.');
      return [];
    }

    // Return with clean, simplified metadata
    return elements.map((el) => {
      return new Document({
        pageContent: el.text || '',
        metadata: {
          documentId,
          page: el.metadata?.page_number || null,
          chapter: null,
          chapterNumber: null,
        },
      });
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Unstructured API Error (Status ${error.response?.status}):`,
        error.response?.data,
      );
    } else {
      console.error('General Unstructured extraction failed:', error);
    }
    return [];
  }
}
