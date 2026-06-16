import Groq from 'groq-sdk';
import { config } from './env';

export const groq = new Groq({
  apiKey: config.GROQ_API_KEY,
});

export const groqConfig = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  max_tokens: 1024,
  response_format: { type: 'json_object' as const },
};
