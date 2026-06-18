import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { DashboardService } from '../dashboard/dashboard.service';
import { AiProvider } from '../../utils/aiProvider';
import { sendSuccess } from '../../utils/apiResponse';

export class ChatController {
  static async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message, history } = req.body;
      const userId = req.user!.userId;

      if (!message) {
        throw { statusCode: 400, code: 'MISSING_MESSAGE', message: 'Message is required' };
      }

      // Fetch user profile and user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });
      const profile = await prisma.userProfile.findUnique({
        where: { userId }
      });

      // Fetch dashboard summary for context
      let summaryText = '';
      try {
        const summary = await DashboardService.getSummary(userId, 'month');
        summaryText = `
User's Monthly Carbon Footprint Stats:
- Total Emissions: ${summary.totalEmissions?.toFixed(1) || 0} kg CO2e
- Regional Average: ${summary.regionalAverage?.toFixed(1) || 0} kg CO2e
- Comparison: ${summary.comparisonPercentage ? `${summary.comparisonPercentage > 0 ? '+' : ''}${summary.comparisonPercentage.toFixed(1)}%` : '0%'} compared to regional average
- Category breakdown:
${summary.categoryBreakdown?.map((c: any) => `  * ${c.category}: ${c.totalKg?.toFixed(1) || 0} kg CO2e`).join('\n') || '  No logged emissions.'}
`;
      } catch (err) {
        console.warn('Failed to load dashboard summary for chat context:', err);
      }

      const systemInstruction = `You are Imprint Assistant, a friendly and premium AI coach integrated directly inside Imprint, a carbon footprint tracking and gamified eco-sustainability web app.

Your goals:
1. Help the user learn how to use Imprint (e.g. logging activities, setting goals under "Weekly Tasks", viewing insights, checking leaderboard).
2. Give highly actionable, realistic, and personalized carbon reduction tips.
3. Reference the user's specific profile and monthly carbon footprint stats to make your answers personalized.

User Info:
- Name: ${user?.name || 'User'}
- Country: ${profile?.country || 'Unknown'}
- Household Size: ${profile?.householdSize || 1}
- Primary Transport: ${profile?.primaryTransport || 'Not specified'}
- Dietary Preference: ${profile?.dietaryPreference || 'Not specified'}
${summaryText}

Conversation Guidelines:
- Keep your tone encouraging, professional, and friendly.
- Be concise (max 3-4 paragraphs) and use markdown formatting (like bullet points and bold text) for readability.
- If they ask how to start: tell them to click the "Log Activity" button on the dashboard to log a ride/food/energy consumption, or go to the "Weekly Tasks" page to complete sustainability challenges.
- Never make up information. If you don't know the answer, politely guide them to app features.`;

      // Build chat conversation prompt including history
      let prompt = '';
      if (history && Array.isArray(history)) {
        // Format history for context. Expected format: [{ role: 'user' | 'assistant', content: string }]
        const formattedHistory = history
          .map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
          .join('\n');
        prompt = `${formattedHistory}\nUser: ${message}\nAssistant:`;
      } else {
        prompt = `User: ${message}\nAssistant:`;
      }

      const reply = await AiProvider.generateText(prompt, systemInstruction);

      return sendSuccess(res, { reply }, 200);
    } catch (error) {
      next(error);
    }
  }
}
