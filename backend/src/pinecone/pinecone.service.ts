import { Injectable } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';

@Injectable()
export class PineconeService {
  private client: Pinecone;
  constructor() {
    this.client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  index(indexName: string) {
    return this.client.index(indexName);
  }
}
