import { geminiModel, genAI } from '../config/gemini';
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

  /**
   * Generates conversational text with system instructions.
   */
  static async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction,
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (geminiError) {
      console.warn('⚠️ Gemini API failed for text, falling back to Groq API', geminiError);

      try {
        const messages: any[] = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const result = await groq.chat.completions.create({
          messages,
          model: groqConfig.model,
          temperature: 0.7,
          max_tokens: 1024,
        });

        return result.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
      } catch (groqError) {
        console.error('❌ Both Gemini and Groq APIs failed for text.', groqError);
        throw new Error('AI Text Generation failed');
      }
    }
  }
}
