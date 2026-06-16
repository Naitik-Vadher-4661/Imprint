# 🌍 Imprint

**Imprint** is a Gamified Carbon Footprint Tracker built to help users understand, reduce, and offset their environmental impact through engaging challenges, AI-driven insights, and community leaderboards.

*Built for Google Prompt Wars! 🚀*

> [!NOTE]  
> **Deployment is still coming soon!** Currently, Imprint is being showcased locally. Stay tuned for the live web application!

## ✨ Features

- **Gamified Tracking:** Earn points, badges, and streaks for logging sustainable activities and reducing your footprint.
- **AI-Powered Insights:** Get highly personalized, actionable recommendations on how to cut emissions based on your daily habits, powered by **Google Gemini**.
- **Accurate Climate Data:** Integrates with **ClimateIQ** for precise carbon emission factors across travel, diet, and household energy.
- **Location Intelligence:** Uses **LocationIQ** to map out green routes and calculate precise travel distances.
- **Secure Authentication:** Full JWT-based user authentication and data privacy.

## 🛠️ Tech Stack

- **Frontend:** Next.js / React (Monorepo setup)
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL (Neon) & Redis (Upstash)
- **AI Integrations:** Google Gemini API
- **External APIs:** ClimateIQ, LocationIQ
- **Analytics:** PostHog

## 🚀 Getting Started (Local Development)

If you have access to the codebase, here is how to run Imprint locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the example environment file and fill in your API keys (Postgres, Redis, Gemini, LocationIQ, ClimateIQ):
```bash
cp .env.example .env
```

### 3. Database Setup
Push the Prisma schema to your database and seed it with demo data:
```bash
npm run typecheck # Ensure types are clean
npm run dev
```

*(Note: Ensure you have run `npx prisma db push` inside the API workspace prior to starting the dev server).*

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

---
*Let's leave a better imprint on the world.* 🌿
