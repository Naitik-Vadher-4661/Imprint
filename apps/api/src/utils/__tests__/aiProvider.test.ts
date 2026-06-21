import { AiProvider } from '../aiProvider';
import { geminiModel, genAI } from '../../config/gemini';
import { groq } from '../../config/groq';

jest.mock('../../config/gemini', () => ({
  geminiModel: {
    generateContent: jest.fn(),
  },
  genAI: {
    getGenerativeModel: jest.fn(),
  },
}));

jest.mock('../../config/groq', () => ({
  groq: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
  groqConfig: {
    model: 'llama3-70b-8192',
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 2048,
  },
}));

describe('AiProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateJson', () => {
    it('should return parsed JSON from Gemini on success', async () => {
      const mockResponse = { insights: [{ title: 'Tip 1' }] };
      (geminiModel.generateContent as jest.Mock).mockResolvedValue({
        response: {
          text: () => JSON.stringify(mockResponse),
        },
      });

      const result = await AiProvider.generateJson('test prompt');

      expect(geminiModel.generateContent).toHaveBeenCalledWith('test prompt');
      expect(result).toEqual(mockResponse);
    });

    it('should fall back to Groq when Gemini fails', async () => {
      (geminiModel.generateContent as jest.Mock).mockRejectedValue(new Error('Gemini down'));

      const mockGroqResponse = { insights: [{ title: 'Groq Tip' }] };
      (groq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockGroqResponse) } }],
      });

      // Suppress console.warn during test
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await AiProvider.generateJson('test prompt');

      expect(groq.chat.completions.create).toHaveBeenCalled();
      expect(result).toEqual(mockGroqResponse);
    });

    it('should throw error when both Gemini and Groq fail', async () => {
      (geminiModel.generateContent as jest.Mock).mockRejectedValue(new Error('Gemini down'));
      (groq.chat.completions.create as jest.Mock).mockRejectedValue(new Error('Groq down'));

      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(AiProvider.generateJson('test prompt')).rejects.toThrow('AI Generation failed');
    });

    it('should throw error when Groq returns no content', async () => {
      (geminiModel.generateContent as jest.Mock).mockRejectedValue(new Error('Gemini down'));
      (groq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(AiProvider.generateJson('test prompt')).rejects.toThrow('AI Generation failed');
    });
  });

  describe('generateText', () => {
    it('should return text from Gemini on success', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => 'Hello, I am your eco coach!' },
        }),
      };
      (genAI.getGenerativeModel as jest.Mock).mockReturnValue(mockModel);

      const result = await AiProvider.generateText('How do I reduce emissions?', 'You are an eco coach.');

      expect(genAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash',
        systemInstruction: 'You are an eco coach.',
      });
      expect(result).toBe('Hello, I am your eco coach!');
    });

    it('should fall back to Groq for text when Gemini fails', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('Gemini text down')),
      };
      (genAI.getGenerativeModel as jest.Mock).mockReturnValue(mockModel);

      (groq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: 'Groq says hi!' } }],
      });

      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await AiProvider.generateText('test', 'system instruction');

      expect(groq.chat.completions.create).toHaveBeenCalledWith(expect.objectContaining({
        messages: [
          { role: 'system', content: 'system instruction' },
          { role: 'user', content: 'test' },
        ],
      }));
      expect(result).toBe('Groq says hi!');
    });

    it('should throw error when both AI providers fail for text', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('Gemini down')),
      };
      (genAI.getGenerativeModel as jest.Mock).mockReturnValue(mockModel);
      (groq.chat.completions.create as jest.Mock).mockRejectedValue(new Error('Groq down'));

      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(AiProvider.generateText('test')).rejects.toThrow('AI Text Generation failed');
    });

    it('should work without system instruction', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('Gemini down')),
      };
      (genAI.getGenerativeModel as jest.Mock).mockReturnValue(mockModel);

      (groq.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: 'Response without system' } }],
      });

      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await AiProvider.generateText('test');

      // Should only have user message, no system message
      expect(groq.chat.completions.create).toHaveBeenCalledWith(expect.objectContaining({
        messages: [{ role: 'user', content: 'test' }],
      }));
      expect(result).toBe('Response without system');
    });
  });
});
