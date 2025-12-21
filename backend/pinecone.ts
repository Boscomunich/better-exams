import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey:
    'pcsk_E9n2a_HhLqVa2yAZkqeBCt8poxuzKD27e99BTXC6i9P1kaPKd8WsnfNjSf1J4aJDEVuxV',
});

const index = pc.index('better-exams');

async function testFetch() {
  const namespace = index.namespace('RViwErEpJCCj3QkobaWx054gOtPfbioi');
  const response = await namespace.searchRecords({
    query: {
      topK: 12,
      inputs: { text: 'what is Perception of design' },
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
  console.log(response.result.hits);
  return;
}

testFetch();
