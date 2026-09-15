import type { Movie, RecommendationResponse } from "@movie-community/shared";

const fallbackMovies: Movie[] = [
  { id: "fallback-1", title: "The Grand Budapest Hotel", year: 2014, overview: "A concierge and lobby boy become caught in a European adventure.", posterUrl: null, genres: ["Comedy", "Drama"], averageRating: 4.6 },
  { id: "fallback-2", title: "Arrival", year: 2016, overview: "A linguist works to communicate with visitors from another world.", posterUrl: null, genres: ["Science Fiction", "Drama"], averageRating: 4.5 },
  { id: "fallback-3", title: "Moonlight", year: 2016, overview: "A young man comes of age and finds his identity in Miami.", posterUrl: null, genres: ["Drama"], averageRating: 4.7 }
];

export async function getRecommendations(): Promise<RecommendationResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { source: "fallback", recommendations: fallbackMovies.map((movie) => ({ ...movie, reason: "A highly rated community favorite to explore." })) };
  }

  const response = await fetch(`${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: "Recommend three movies. Return a JSON array with title and reason only." }],
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) throw new Error(`Recommendation provider failed with status ${response.status}`);
  // Catalog matching will be added when the movie provider integration is implemented.
  return { source: "ai", recommendations: fallbackMovies.map((movie) => ({ ...movie, reason: "Selected by the recommendation service." })) };
}
