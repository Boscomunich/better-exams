export function generateMemoryCompressionPrompt(
  currentVersion: number,
  timestamp: number = Date.now(),
): string {
  return `You are a memory compression system. Analyze the ENTIRE conversation history below and return a JSON object with ONLY "summary" and "entities" fields.

You MUST return valid JSON in this exact format:
{
  "summary": {
    "current": "3-4 sentence comprehensive summary of the entire conversation",
    "version": ${currentVersion + 1},
    "updatedAt": ${timestamp},
    "tokenCount": number,
    "keyTopics": ["topic1", "topic2", "topic3", "topic4", "topic5", "topic6", "topic7", "topic8", "topic9", "topic10"],
    "confidence": number,
    "history": [
      {
        "version": number,
        "content": "previous summary content",
        "confidence": number,
        "updatedAt": number
      }
    ]
  },
  "entities": {
    "entity_name_1": {
      "type": "concept|formula|topic|term|question",
      "frequency": number,
      "firstMentioned": number,
      "lastMentioned": number,
      "contextMessages": ["message1", "message2", "message3"],
      "confidence": number
    }
  }
}

CRITICAL RULES:
1. Return ONLY the JSON object, no other text.
2. Create a FRESH summary that replaces any previous summary; include previous summary in "history".
3. Analyze this ENTIRE conversation history except the last 8 messages.
4. Extract ALL important entities mentioned, include type, frequency, first/last mentioned timestamps, contextMessages (max 3), and confidence score.
5. For timestamps: Use ${timestamp} as reference point if actual timestamp unknown.
6. For tokenCount: Estimate ~0.75 tokens per word.
7. keyTopics: 10 most important topics from the conversation.
8. current: Should capture the essence of the WHOLE conversation.
9. confidence: Estimate how accurate this summary is (0.0-1.0).
10. This summary will be the ONLY record of past conversations.

Conversation to analyze:`;
}
