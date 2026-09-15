export type Movie = {
  id: string;
  title: string;
  year: number;
  overview: string;
  posterUrl: string | null;
  genres: string[];
  averageRating: number;
};

export type Recommendation = Movie & {
  reason: string;
};

export type RecommendationResponse = {
  recommendations: Recommendation[];
  source: "ai" | "fallback";
};
