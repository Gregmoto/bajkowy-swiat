---
name: Bajkowy Świat – Fairy Tale App
description: Polish-language Next.js app for generating personalized children's fairy tales with Claude AI and Neon PostgreSQL
type: project
---

## Project: Bajkowy Świat (Fairy Tale World)

App location: /Users/dator/Documents/DEV1/Test

**Why:** User wants a Polish-language web app where parents can create personalized fairy tales featuring their child as the main character.

**Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, Neon PostgreSQL, React Hook Form + Zod, shadcn/ui, @anthropic-ai/sdk (claude-opus-4-6)

**How to apply:** When working on this project, check the .env.example for required env vars (ANTHROPIC_API_KEY, DATABASE_URL, DIRECT_URL). Run `npx prisma db push` after setting up Neon DB. Uses streaming Anthropic SDK calls with adaptive thinking for fairy tale generation.

**Key routes:**
- `/` – homepage with list of created tales (server component)
- `/nowa-bajka` – form to create a new tale (client component BajkaForm)
- `/bajki/[id]` – display a specific tale (server component)
- `POST /api/generuj` – generates tale via Claude and saves to DB
- `GET/DELETE /api/bajki/[id]` – CRUD for individual tales
