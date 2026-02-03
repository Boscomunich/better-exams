import { Provider } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';

export const AI_MODEL = Symbol('AI_MODEL');
export const HEAVY_AI_MODEL = Symbol('HEAVY_AI_MODEL');
export const LIGHT_AI_MODEL = Symbol('LIGHT_AI_MODEL');

export const HeavyAiModelProvider: Provider = {
  provide: HEAVY_AI_MODEL,
  useFactory: () => {
    return new ChatOpenAI({
      apiKey: process.env.NVIDIA_NIM_API_KEY,
      model: 'meta/llama-3.3-70b-instruct',
      temperature: 0.6,
      configuration: {
        baseURL: 'https://integrate.api.nvidia.com/v1',
      },
    });
  },
};

export const AiModelProvider: Provider = {
  provide: AI_MODEL,
  useFactory: () => {
    return new ChatOpenAI({
      apiKey: process.env.NVIDIA_NIM_API_KEY,
      model: 'meta/llama-4-maverick-17b-128e-instruct',
      temperature: 0.2,
      maxTokens: 4096,
      configuration: {
        baseURL: 'https://integrate.api.nvidia.com/v1',
      },
    });
  },
};

export const LightAiModelProvider: Provider = {
  provide: LIGHT_AI_MODEL,
  useFactory: () => {
    return new ChatOllama({
      model: 'llama3.2:latest',
      temperature: 0,
      maxRetries: 2,
      streaming: false,
    });
  },
};
