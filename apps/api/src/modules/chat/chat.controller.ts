import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/database';
import { DashboardService } from '../dashboard/dashboard.service';
import { AiProvider } from '../../utils/aiProvider';
import { sendSuccess } from '../../utils/apiResponse';
import { AppError } from '../../utils/AppError';

export class ChatController {
  static async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message, history } = req.body;
      const userId = req.user!.userId;

      let sanitizedMessage = '';
      if (typeof message === 'string') {
        sanitizedMessage = message.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim().substring(0, 2000);
      }

      if (!sanitizedMessage) {
        throw AppError.badRequest('Message is required', 'MISSING_MESSAGE');
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
        const total = summary.totalEmissionKg || 0;
        const avg = summary.regionalAverageKg || 0;
        const comparisonPercentage = avg > 0 ? ((total - avg) / avg) * 100 : 0;

        summaryText = `
User's Monthly Carbon Footprint Stats:
- Total Emissions: ${total.toFixed(1)} kg CO2e
- Regional Average: ${avg.toFixed(1)} kg CO2e
- Comparison: ${comparisonPercentage ? `${comparisonPercentage > 0 ? '+' : ''}${comparisonPercentage.toFixed(1)}%` : '0%'} compared to regional average
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

      // Sanitize history and enforce structure
      let sanitizedHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
      if (history && Array.isArray(history)) {
        sanitizedHistory = history
          .filter((h: any) => h && typeof h.content === 'string' && (h.role === 'user' || h.role === 'assistant'))
          .map((h: any) => ({
            role: h.role,
            content: h.content.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim().substring(0, 2000)
          }));
      }

      // Build chat conversation prompt including history
      let prompt = '';
      if (sanitizedHistory.length > 0) {
        const formattedHistory = sanitizedHistory
          .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
          .join('\n');
        prompt = `${formattedHistory}\nUser: ${sanitizedMessage}\nAssistant:`;
      } else {
        prompt = `User: ${sanitizedMessage}\nAssistant:`;
      }

      const reply = await AiProvider.generateText(prompt, systemInstruction);

      return sendSuccess(res, { reply }, 200);
    } catch (error) {
      next(error);
    }
  }
}

