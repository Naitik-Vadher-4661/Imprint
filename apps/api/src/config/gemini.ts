import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './env';

export const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 1024,
    responseMimeType: 'application/json',
  },
});
