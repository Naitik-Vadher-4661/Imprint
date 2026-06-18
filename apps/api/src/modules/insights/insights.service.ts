import { prisma } from '../../config/database';
import { AiProvider } from '../../utils/aiProvider';
import { InsightType, InsightSource } from '../../types/enums';

export class InsightsService {
  static async generateInsightsForUser(userId: string) {
    // 1. Fetch user data (activities from past 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [user, activities] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
      prisma.activity.findMany({
        where: { userId, loggedAt: { gte: thirtyDaysAgo } },
        include: { category: true }
      })
    ]);

    if (!user) return null;
    if (activities.length === 0) {
      throw { statusCode: 400, code: 'NO_ACTIVITIES', message: 'You must log at least one activity first to generate AI insights.' };
    }

    // 2. Prepare context for AI prompt
    const activitySummary = activities.map(a => `${a.category.name}: ${a.value}${a.unit} (${a.emissionKg}kg CO2e)`).join('\n');
    
    const prompt = `
      You are an expert sustainability coach. Review the user's carbon footprint activities over the last 30 days:
      User Profile: ${JSON.stringify(user.profile)}
      Activities:
      ${activitySummary}

      Provide 3 actionable insights as a JSON object with a key "insights" containing an array.
      Each insight should have:
      - title: A short, catchy title
      - description: A clear explanation of the insight
      - type: One of "HABIT_ANALYSIS", "PERSONALIZED_TIPS", "WEEKLY_DIGEST", "ALTERNATIVES", "PROJECTION"
      - emissionSavedPotential: An estimated number in kg CO2e that could be saved, or 0 if not applicable.
    `;

    // 3. Generate Insights via AI Provider (Gemini -> Groq Fallback)
    const generatedResult = await AiProvider.generateJson(prompt);
    const generatedInsights = generatedResult.insights || generatedResult;

    // 4. Save Insights to DB — content is stored as JSON
    const now = new Date();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const savedInsights = await Promise.all(
      generatedInsights.map((insight: any) => 
        prisma.insight.create({
          data: {
            userId,
            type: (insight.type as InsightType) || 'PERSONALIZED_TIPS',
            source: 'GEMINI' as InsightSource,
            content: JSON.stringify({
              title: insight.title,
              description: insight.description,
              emissionSavedPotential: insight.emissionSavedPotential || 0,
            }),
            expiresAt,
          }
        })
      )
    );

    return savedInsights.map(insight => {
      try {
        return {
          ...insight,
          content: JSON.parse(insight.content)
        };
      } catch (e) {
        return insight;
      }
    });
  }

  static async getUserInsights(userId: string) {
    const insights = await prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return insights.map(insight => {
      try {
        return {
          ...insight,
          content: JSON.parse(insight.content)
        };
      } catch (e) {
        return {
          ...insight,
          content: { title: 'Insight', description: insight.content, emissionSavedPotential: 0 }
        };
      }
    });
  }


  static async markInsightAsActioned(userId: string, insightId: string) {
    // Verify ownership
    const insight = await prisma.insight.findFirst({
      where: { id: insightId, userId }
    });
    if (!insight) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Insight not found' };
    }
    return { success: true, id: insightId };
  }
}
