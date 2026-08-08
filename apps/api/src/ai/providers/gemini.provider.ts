import { Injectable } from '@nestjs/common';
import { AiProvider } from '../interfaces/ai-provider.interface';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiProvider implements AiProvider {
  private genAI: GoogleGenerativeAI;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock');
  }
  
  async extractTransaction(text: string, userId: string) {
      // Mock implementation for compilation
      return {
          type: 'expense' as const,
          category: 'Alimentação',
          amount: 10,
          description: text,
          date: new Date().toISOString(),
          confidence: 0.9,
      }
  }
}
