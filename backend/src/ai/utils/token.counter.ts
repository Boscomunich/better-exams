import { encodingForModel, TiktokenModel } from 'js-tiktoken';

export class TokenUtils {
  private static readonly encoder = encodingForModel('gpt-4o' as TiktokenModel);
  static estimate(text: string): number {
    return this.encoder.encode(text).length;
  }
}
