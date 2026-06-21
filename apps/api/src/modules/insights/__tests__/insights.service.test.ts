import { InsightsService } from '../insights.service';
import { prisma } from '../../../config/database';
import { AiProvider } from '../../../utils/aiProvider';

jest.mock('../../../config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
    },
    insight: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('../../../utils/aiProvider', () => ({
  AiProvider: {
    generateJson: jest.fn(),
  },
}));

describe('InsightsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateInsightsForUser', () => {
    it('should return null if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);

      const result = await InsightsService.generateInsightsForUser('user-123');
      expect(result).toBeNull();
    });

    it('should throw error if user has no logged activities in past 30 days', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-123', profile: {} });
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        InsightsService.generateInsightsForUser('user-123')
      ).rejects.toEqual({
        statusCode: 400,
        code: 'NO_ACTIVITIES',
        message: 'You must log at least one activity first to generate AI insights.',
      });
    });

    it('should call AiProvider and save/return parsed insights on success', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        profile: { primaryTransport: 'car' },
      });
      (prisma.activity.findMany as jest.Mock).mockResolvedValue([
        { value: 10, unit: 'KM', emissionKg: 5, category: { name: 'Transport' } },
      ]);

      const mockAiResponse = {
        insights: [
          {
            title: 'Use alternative transport',
            description: 'Try biking to reduce travel emissions.',
            type: 'ALTERNATIVES',
            emissionSavedPotential: 5,
          },
        ],
      };
      (AiProvider.generateJson as jest.Mock).mockResolvedValue(mockAiResponse);

      const mockCreatedInsight = {
        id: 'insight-1',
        userId: 'user-123',
        type: 'ALTERNATIVES',
        source: 'GEMINI',
        content: JSON.stringify({
          title: 'Use alternative transport',
          description: 'Try biking to reduce travel emissions.',
          emissionSavedPotential: 5,
        }),
        createdAt: new Date(),
        expiresAt: new Date(),
      };
      (prisma.insight.create as jest.Mock).mockResolvedValue(mockCreatedInsight);

      const result = await InsightsService.generateInsightsForUser('user-123');

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(prisma.activity.findMany).toHaveBeenCalled();
      expect(AiProvider.generateJson).toHaveBeenCalled();
      expect(prisma.insight.create).toHaveBeenCalled();
      expect(result).toEqual([
        {
          ...mockCreatedInsight,
          content: {
            title: 'Use alternative transport',
            description: 'Try biking to reduce travel emissions.',
            emissionSavedPotential: 5,
          },
        },
      ]);
    });
  });

  describe('getUserInsights', () => {
    it('should return historical insights with parsed content', async () => {
      const mockInsight = {
        id: 'insight-1',
        userId: 'user-123',
        type: 'PERSONALIZED_TIPS',
        content: JSON.stringify({
          title: 'Eco Tip',
          description: 'Save power.',
          emissionSavedPotential: 2,
        }),
      };
      (prisma.insight.findMany as jest.Mock).mockResolvedValue([mockInsight]);

      const result = await InsightsService.getUserInsights('user-123');

      expect(prisma.insight.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      expect(result).toEqual([
        {
          ...mockInsight,
          content: {
            title: 'Eco Tip',
            description: 'Save power.',
            emissionSavedPotential: 2,
          },
        },
      ]);
    });

    it('should handle unparseable content by returning a default structure', async () => {
      const mockInsight = {
        id: 'insight-1',
        userId: 'user-123',
        type: 'PERSONALIZED_TIPS',
        content: 'plain text content that is not json',
      };
      (prisma.insight.findMany as jest.Mock).mockResolvedValue([mockInsight]);

      const result = await InsightsService.getUserInsights('user-123');

      expect(result).toEqual([
        {
          ...mockInsight,
          content: {
            title: 'Insight',
            description: 'plain text content that is not json',
            emissionSavedPotential: 0,
          },
        },
      ]);
    });
  });

  describe('markInsightAsActioned', () => {
    it('should throw error if insight not found or belongs to another user', async () => {
      (prisma.insight.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        InsightsService.markInsightAsActioned('user-123', 'insight-1')
      ).rejects.toEqual({
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Insight not found',
      });
    });

    it('should return success if insight is owned by user', async () => {
      (prisma.insight.findFirst as jest.Mock).mockResolvedValue({ id: 'insight-1', userId: 'user-123' });

      const result = await InsightsService.markInsightAsActioned('user-123', 'insight-1');

      expect(prisma.insight.findFirst).toHaveBeenCalledWith({
        where: { id: 'insight-1', userId: 'user-123' },
      });
      expect(result).toEqual({ success: true, id: 'insight-1' });
    });
  });
});
