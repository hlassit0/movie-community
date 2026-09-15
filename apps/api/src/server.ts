import "dotenv/config";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { Activity, Movie, MovieDetails, Review, User } from "@movie-community/shared";
import { fallbackMovies, getRecommendations } from "./recommendations.js";

const app = Fastify({ logger: true });
const prisma = new PrismaClient();
const USER_ID = "demo-user";

const demoUser: User = {
  id: USER_ID,
  email: "maya@example.com",
  name: "Maya Chen",
  handle: "@mayachen",
  avatarUrl: null
};

const secondUser = {
  id: "user-jordan",
  name: "Jordan Ellis",
  handle: "@jordanelis",
  avatarUrl: null
};

const memoryMovies: Movie[] = fallbackMovies.map((movie) => ({ ...movie }));
const memoryWatchlist = new Set<string>(["movie-aftersun", "movie-perfect-days"]);
const memoryRatings = new Map<string, number>([[`${USER_ID}:movie-past-lives`, 5]]);
const memoryReviews: Review[] = [
  {
    id: "review-demo-1",
    body: "The kind of movie that gets more beautiful the longer you sit with it.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user: { id: USER_ID, name: demoUser.name, handle: demoUser.handle, avatarUrl: demoUser.avatarUrl },
    movieId: "movie-past-lives"
  },
  {
    id: "review-demo-2",
    body: "Every frame feels composed, but the emotions never feel staged.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    user: secondUser,
    movieId: "movie-grand-budapest"
  }
];

let databaseAvailable = false;

type DbMovie = {
  id: string;
  externalId: string | null;
  title: string;
  year: number;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  genres: string[];
  runtime: number | null;
  director: string | null;
  cast: string[];
  averageRating: number;
  ratingCount: number;
};

function toMovie(movie: DbMovie): Movie {
  return {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    overview: movie.overview,
    posterUrl: movie.posterUrl,
    backdropUrl: movie.backdropUrl,
    genres: movie.genres,
    averageRating: movie.averageRating,
    ratingCount: movie.ratingCount,
    runtime: movie.runtime ?? undefined,
    director: movie.director ?? undefined,
    cast: movie.cast
  };
}

function findMemoryMovie(id: string) {
  return memoryMovies.find((movie) => movie.id === id);
}

function reviewsForMovie(movieId: string) {
  return memoryReviews.filter((review) => review.movieId === movieId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function disableDatabase(error: unknown) {
  databaseAvailable = false;
  app.log.warn({ error }, "Database unavailable; using the seeded demo store");
}

async function connectDatabase() {
  try {
    await prisma.$connect();
    await prisma.user.upsert({
      where: { id: USER_ID },
      update: { name: demoUser.name, handle: demoUser.handle },
      create: { id: USER_ID, email: demoUser.email, name: demoUser.name, handle: demoUser.handle }
    });

    for (const movie of memoryMovies) {
      await prisma.movie.upsert({
        where: { id: movie.id },
        update: {},
        create: {
          id: movie.id,
          title: movie.title,
          year: movie.year,
          overview: movie.overview,
          posterUrl: movie.posterUrl,
          backdropUrl: movie.backdropUrl,
          genres: movie.genres,
          averageRating: movie.averageRating,
          ratingCount: movie.ratingCount,
          runtime: movie.runtime,
          director: movie.director,
          cast: movie.cast ?? []
        }
      });
    }
    for (const movieId of ["movie-aftersun", "movie-perfect-days"]) {
      await prisma.watchlist.upsert({
        where: { userId_movieId: { userId: USER_ID, movieId } },
        update: {},
        create: { userId: USER_ID, movieId }
      });
    }
    await prisma.rating.upsert({
      where: { userId_movieId: { userId: USER_ID, movieId: "movie-past-lives" } },
      update: { score: 5 },
      create: { userId: USER_ID, movieId: "movie-past-lives", score: 5 }
    });
    databaseAvailable = true;
    app.log.info("Connected to PostgreSQL and seeded the movie catalog");
  } catch (error) {
    await disableDatabase(error);
  }
}

async function listMovies() {
  if (databaseAvailable) {
    try {
      const movies = await prisma.movie.findMany({ orderBy: { averageRating: "desc" } });
      return movies.map((movie) => toMovie(movie));
    } catch (error) {
      await disableDatabase(error);
    }
  }
  return memoryMovies;
}

async function getMovie(id: string) {
  if (databaseAvailable) {
    try {
      const movie = await prisma.movie.findUnique({ where: { id } });
      return movie ? toMovie(movie) : undefined;
    } catch (error) {
      await disableDatabase(error);
    }
  }
  return findMemoryMovie(id);
}

async function getWatchlist(userId: string) {
  if (databaseAvailable) {
    try {
      const rows = await prisma.watchlist.findMany({ where: { userId }, include: { movie: true }, orderBy: { createdAt: "desc" } });
      return rows.map((row) => toMovie(row.movie));
    } catch (error) {
      await disableDatabase(error);
    }
  }
  return [...memoryWatchlist].map(findMemoryMovie).filter((movie): movie is Movie => Boolean(movie));
}

async function getReviews(movieId: string) {
  if (databaseAvailable) {
    try {
      const rows = await prisma.review.findMany({
        where: { movieId },
        include: { user: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" }
      });
      return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
    } catch (error) {
      await disableDatabase(error);
    }
  }
  return reviewsForMovie(movieId);
}

function currentUserSummary(user: User) {
  return { id: user.id, name: user.name, handle: user.handle, avatarUrl: user.avatarUrl };
}

async function makeActivity(): Promise<Activity[]> {
  const [pastLives, grandBudapest] = await Promise.all([getMovie("movie-past-lives"), getMovie("movie-grand-budapest")]);
  if (!pastLives || !grandBudapest) return [];
  return [
    { id: "activity-1", kind: "review", user: currentUserSummary(demoUser), movie: pastLives, body: "The kind of movie that gets more beautiful the longer you sit with it.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { id: "activity-2", kind: "rating", user: secondUser, movie: grandBudapest, score: 5, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    { id: "activity-3", kind: "watchlist", user: { id: "user-nina", name: "Nina Park", handle: "@ninapark", avatarUrl: null }, movie: pastLives, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString() }
  ];
}

const reviewBody = z.object({ body: z.string().trim().min(3).max(1000), userId: z.string().optional() });
const ratingBody = z.object({ score: z.number().int().min(1).max(5), userId: z.string().optional() });
const watchlistBody = z.object({ userId: z.string().optional() });

await app.register(cors, { origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" });

app.get("/health", async () => ({ status: "ok", database: databaseAvailable ? "connected" : "demo" }));

app.get("/api/me", async () => demoUser);

app.get<{ Querystring: { q?: string; genre?: string } }>("/api/movies", async (request) => {
  const movies = await listMovies();
  const query = request.query.q?.trim().toLowerCase();
  const genre = request.query.genre?.trim().toLowerCase();
  return movies.filter((movie) => {
    const matchesQuery = !query || `${movie.title} ${movie.overview} ${movie.director ?? ""}`.toLowerCase().includes(query);
    const matchesGenre = !genre || movie.genres.some((item) => item.toLowerCase() === genre);
    return matchesQuery && matchesGenre;
  });
});

app.get<{ Params: { id: string } }>("/api/movies/:id", async (request, reply) => {
  const movie = await getMovie(request.params.id);
  if (!movie) return reply.code(404).send({ message: "Movie not found" });
  const reviews = await getReviews(movie.id);
  const watchlist = await getWatchlist(USER_ID);
  const userRating = databaseAvailable
    ? (await prisma.rating.findUnique({ where: { userId_movieId: { userId: USER_ID, movieId: movie.id } } }))?.score ?? null
    : memoryRatings.get(`${USER_ID}:${movie.id}`) ?? null;
  const details: MovieDetails = { ...movie, reviews, userRating, watchlisted: watchlist.some((item) => item.id === movie.id) };
  return details;
});

app.get("/api/feed", async () => {
  const movies = await listMovies();
  const watchlist = await getWatchlist(USER_ID);
  return { featured: movies[0], movies, watchlist, activity: await makeActivity() };
});

app.get("/api/recommendations", async () => getRecommendations(await listMovies()));

app.get<{ Querystring: { userId?: string } }>("/api/watchlist", async (request) => getWatchlist(request.query.userId ?? USER_ID));

app.post<{ Params: { movieId: string }; Body: unknown }>("/api/watchlist/:movieId", async (request, reply) => {
  const movie = await getMovie(request.params.movieId);
  if (!movie) return reply.code(404).send({ message: "Movie not found" });
  const parsed = watchlistBody.safeParse(request.body ?? {});
  const userId = parsed.success ? parsed.data.userId ?? USER_ID : USER_ID;

  if (databaseAvailable) {
    await prisma.watchlist.upsert({ where: { userId_movieId: { userId, movieId: movie.id } }, update: {}, create: { userId, movieId: movie.id } });
  } else {
    memoryWatchlist.add(movie.id);
  }
  return { saved: true, movie };
});

app.delete<{ Params: { movieId: string }; Querystring: { userId?: string } }>("/api/watchlist/:movieId", async (request) => {
  const userId = request.query.userId ?? USER_ID;
  if (databaseAvailable) {
    await prisma.watchlist.deleteMany({ where: { userId, movieId: request.params.movieId } });
  } else {
    memoryWatchlist.delete(request.params.movieId);
  }
  return { saved: false };
});

app.post<{ Params: { movieId: string }; Body: unknown }>("/api/ratings/:movieId", async (request, reply) => {
  const parsed = ratingBody.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ message: "Score must be an integer from 1 to 5" });
  const movie = await getMovie(request.params.movieId);
  if (!movie) return reply.code(404).send({ message: "Movie not found" });
  const userId = parsed.data.userId ?? USER_ID;

  if (databaseAvailable) {
    await prisma.rating.upsert({ where: { userId_movieId: { userId, movieId: movie.id } }, update: { score: parsed.data.score }, create: { userId, movieId: movie.id, score: parsed.data.score } });
    const aggregate = await prisma.rating.aggregate({ where: { movieId: movie.id }, _avg: { score: true }, _count: { score: true } });
    await prisma.movie.update({ where: { id: movie.id }, data: { averageRating: aggregate._avg.score ?? 0, ratingCount: aggregate._count.score } });
  } else {
    memoryRatings.set(`${userId}:${movie.id}`, parsed.data.score);
    const allRatings = [...memoryRatings.entries()].filter(([key]) => key.endsWith(`:${movie.id}`)).map(([, score]) => score);
    movie.averageRating = allRatings.reduce((sum, score) => sum + score, 0) / allRatings.length || movie.averageRating;
    movie.ratingCount = Math.max(movie.ratingCount ?? 0, allRatings.length);
  }
  return { score: parsed.data.score };
});

app.post<{ Params: { movieId: string }; Body: unknown }>("/api/reviews/:movieId", async (request, reply) => {
  const parsed = reviewBody.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ message: "Review must be between 3 and 1000 characters" });
  const movie = await getMovie(request.params.movieId);
  if (!movie) return reply.code(404).send({ message: "Movie not found" });
  const userId = parsed.data.userId ?? USER_ID;

  if (databaseAvailable) {
    await prisma.review.create({ data: { body: parsed.data.body, userId, movieId: movie.id } });
  } else {
    memoryReviews.unshift({ id: `review-${Date.now()}`, body: parsed.data.body, createdAt: new Date().toISOString(), user: currentUserSummary(demoUser), movieId: movie.id });
  }
  return { review: (await getReviews(movie.id))[0] };
});

await connectDatabase();

app.listen({ port: Number(process.env.PORT ?? 4000), host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
