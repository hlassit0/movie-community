# Reelroom

Reelroom is a movie-first social discovery app inspired by the community feel of Fable. It gives people a place to discover films, keep a watchlist, rate movies, write short reviews, and see what their film people are watching.

## Stack

- **Web:** React, Vite, TypeScript
- **API:** Fastify, TypeScript, Zod
- **Data:** PostgreSQL, Prisma
- **Shared contracts:** TypeScript package

## Run locally

```bash
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:4000.

If PostgreSQL is not running, the API automatically starts in demo mode with the seeded movie catalog. The UI stays usable in demo mode, and switches to persistent PostgreSQL-backed mutations as soon as the database is available.

## Implemented flows

- Home feed with a featured film, personalized picks, friend activity, and watchlist preview
- Catalog search and genre filters
- Movie detail modal with poster/backdrop, cast, rating, reviews, and save action
- Watchlist create/remove flow
- 1–5 star ratings and review posting
- Community feed and people-to-follow UI
- Responsive sidebar/navigation for desktop and mobile
- Prisma models for users, movies, ratings, reviews, and watchlists

## API routes

`GET /health`, `GET /api/me`, `GET /api/feed`, `GET /api/movies`, `GET /api/movies/:id`, `GET /api/recommendations`, `GET /api/watchlist`, `POST|DELETE /api/watchlist/:movieId`, `POST /api/ratings/:movieId`, and `POST /api/reviews/:movieId`.

The current local experience uses a demo account (`Maya Chen`) so the product can be explored without an authentication provider. The next production step would be replacing that demo identity with session-based auth and a real movie metadata provider.
