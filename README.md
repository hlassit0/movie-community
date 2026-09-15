# Movie Community

A team-ready starting point for a social movie discovery app inspired by the community features of Fable. Users will be able to track movies, rate and review them, create lists, follow friends, and receive personalized recommendations.

## Stack

- **Web:** React, Vite, TypeScript
- **API:** Fastify, TypeScript
- **Data:** PostgreSQL, Prisma
- **Shared contracts:** TypeScript package
- **AI:** Optional OpenAI-compatible recommendation provider with a local fallback

## Quick start

```bash
cp .env.example .env
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:4000.

## Project ownership map

- `apps/web`: UI, routing, client state, accessibility, visual design
- `apps/api`: HTTP routes, authentication, recommendation orchestration
- `apps/api/prisma`: database schema and migrations
- `packages/shared`: request/response types shared by web and API

See [CONTRIBUTING.md](./CONTRIBUTING.md) for suggested workstreams.
