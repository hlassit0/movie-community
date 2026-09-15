export type Movie = {
  id: string;
  title: string;
  year: number;
  overview: string;
  posterUrl: string | null;
  backdropUrl?: string | null;
  genres: string[];
  averageRating: number;
  ratingCount?: number;
  runtime?: number;
  director?: string;
  cast?: string[];
};

export type Recommendation = Movie & {
  reason: string;
};

export type RecommendationResponse = {
  recommendations: Recommendation[];
  source: "ai" | "fallback";
};

export type User = {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl?: string | null;
};

export type Review = {
  id: string;
  body: string;
  createdAt: string;
  user: Pick<User, "id" | "name" | "handle" | "avatarUrl">;
  movieId: string;
};

export type MovieDetails = Movie & {
  reviews: Review[];
  userRating?: number | null;
  watchlisted?: boolean;
};

export type Activity = {
  id: string;
  kind: "review" | "rating" | "watchlist";
  user: Pick<User, "id" | "name" | "handle" | "avatarUrl">;
  movie: Movie;
  body?: string;
  score?: number;
  createdAt: string;
};

export type FeedResponse = {
  featured: Movie;
  movies: Movie[];
  watchlist: Movie[];
  activity: Activity[];
};
