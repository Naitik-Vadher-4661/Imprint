import { geminiModel } from '../config/gemini';
import { groq, groqConfig } from '../config/groq';

export class AiProvider {
  /**
   * Generates AI text using Gemini with a fallback to Groq.
   * Expects a JSON response based on the prompt.
   */
  static async generateJson(prompt: string): Promise<any> {
    try {
      // Primary: Google Gemini
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (geminiError) {
      console.warn('⚠️ Gemini API failed, falling back to Groq API', geminiError);

      try {
        // Fallback: Groq Llama 3
        const result = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: groqConfig.model,
          response_format: groqConfig.response_format,
          temperature: groqConfig.temperature,
          max_tokens: groqConfig.max_tokens,
        });

        const content = result.choices[0]?.message?.content;
        if (!content) throw new Error('No content returned from Groq');

        return JSON.parse(content);
      } catch (groqError) {
        console.error('❌ Both Gemini and Groq APIs failed.', groqError);
        throw new Error('AI Generation failed');
      }
    }
  }
}
