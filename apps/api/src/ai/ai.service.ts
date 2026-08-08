import { Injectable } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class AiService {
  constructor(private geminiProvider: GeminiProvider) {}
  
  async processText(text: string, userId: string) {
    return this.geminiProvider.extractTransaction(text, userId);
  }
}
