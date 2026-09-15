import type { Movie, RecommendationResponse } from "@movie-community/shared";

const fallbackMovies: Movie[] = [
  { id: "movie-past-lives", title: "Past Lives", year: 2023, overview: "Two childhood friends reunite in New York for one fateful week.", posterUrl: "https://image.tmdb.org/t/p/w780/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/6DmgPTZYaug7QfvKNsU9B3z2QY.jpg", genres: ["Romance", "Drama"], averageRating: 4.7, ratingCount: 1240, runtime: 106, director: "Celine Song", cast: ["Greta Lee", "Teo Yoo", "John Magaro"] },
  { id: "movie-grand-budapest", title: "The Grand Budapest Hotel", year: 2014, overview: "A legendary concierge and his lobby boy become caught in a European adventure.", posterUrl: "https://image.tmdb.org/t/p/w780/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/n1y094tVDFATSzkTnFxoGZ1qNsG.jpg", genres: ["Comedy", "Drama"], averageRating: 4.6, ratingCount: 1890, runtime: 100, director: "Wes Anderson", cast: ["Ralph Fiennes", "Tony Revolori", "Saoirse Ronan"] },
  { id: "movie-arrival", title: "Arrival", year: 2016, overview: "A linguist works to communicate with visitors from another world.", posterUrl: "https://image.tmdb.org/t/p/w780/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/6dX9WFn3R9vV4a6O1fN9cQ2m5sY.jpg", genres: ["Science Fiction", "Drama"], averageRating: 4.5, ratingCount: 1632, runtime: 116, director: "Denis Villeneuve", cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"] },
  { id: "movie-moonlight", title: "Moonlight", year: 2016, overview: "A young man comes of age and finds his identity in Miami.", posterUrl: "https://image.tmdb.org/t/p/w780/4911T5FbJ9eD2Faz5Zdj8GgQm2Z.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/6wF2GdKq7N8Y9Z9eP4H5K6L7M8N.jpg", genres: ["Drama"], averageRating: 4.7, ratingCount: 2104, runtime: 111, director: "Barry Jenkins", cast: ["Mahershala Ali", "Trevante Rhodes", "Naomie Harris"] },
  { id: "movie-aftersun", title: "Aftersun", year: 2022, overview: "A daughter looks back on a holiday with her father and the memories that remain.", posterUrl: "https://image.tmdb.org/t/p/w780/evKzKX0Y1m7s6wH8qB5qR4o3w2P.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/9fE7D2cL5vH1bN3mQ8wR0tS6yU.jpg", genres: ["Drama"], averageRating: 4.6, ratingCount: 984, runtime: 101, director: "Charlotte Wells", cast: ["Paul Mescal", "Frankie Corio", "Celia Rowlson-Hall"] },
  { id: "movie-parasite", title: "Parasite", year: 2019, overview: "A cash-strapped family slowly works its way into the life of a wealthy household.", posterUrl: "https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/ApiEF3wP8Y2cW0zM4rT6vN1sQ9L.jpg", genres: ["Thriller", "Drama"], averageRating: 4.8, ratingCount: 2890, runtime: 132, director: "Bong Joon Ho", cast: ["Song Kang-ho", "Choi Woo-shik", "Park So-dam"] },
  { id: "movie-perfect-days", title: "Perfect Days", year: 2023, overview: "A quiet Tokyo routine opens into a series of small, luminous moments.", posterUrl: "https://image.tmdb.org/t/p/w780/1KJQ8e7R5y4T3u2i1o0p9N8m7L.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/2L6m0Q9v7K5s3R1t8Y4u6I0oP.jpg", genres: ["Drama"], averageRating: 4.4, ratingCount: 611, runtime: 124, director: "Wim Wenders", cast: ["Koji Yakusho", "Tokio Emoto", "Arisa Nakano"] },
  { id: "movie-holdovers", title: "The Holdovers", year: 2023, overview: "A curmudgeonly teacher and two students find an unexpected family over winter break.", posterUrl: "https://image.tmdb.org/t/p/w780/VHSzNBTwxV8vh7wylo7O9CLdac.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/1G5oW1D7aT8s3R2v6Y9u4I0pL.jpg", genres: ["Comedy", "Drama"], averageRating: 4.5, ratingCount: 1394, runtime: 133, director: "Alexander Payne", cast: ["Paul Giamatti", "Da'Vine Joy Randolph", "Dominic Sessa"] }
];

export async function getRecommendations(movies: Movie[] = fallbackMovies): Promise<RecommendationResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { source: "fallback", recommendations: movies.slice(0, 4).map((movie, index) => ({ ...movie, reason: ["A highly rated community favorite to explore.", "A thoughtful slow-burn with a lot to talk about.", "For when you want something beautifully made and emotionally precise.", "A recent favorite making the rounds in the community."][index] })) };
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
  return { source: "ai", recommendations: movies.slice(0, 4).map((movie) => ({ ...movie, reason: "Selected by the recommendation service." })) };
}

export { fallbackMovies };
