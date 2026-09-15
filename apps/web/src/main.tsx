import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { RecommendationResponse } from "@movie-community/shared";
import "./styles.css";

function App() {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("http://localhost:4000/api/recommendations").then(async (response) => {
      if (!response.ok) throw new Error("Unable to load recommendations");
      setData(await response.json());
    }).catch((reason: Error) => setError(reason.message));
  }, []);

  return <main>
    <nav><strong>reel<span>mates</span></strong><a href="#discover">Discover</a><a href="#watchlist">Watchlist</a><button>Sign in</button></nav>
    <section className="hero"><p className="eyebrow">YOUR NEXT FAVORITE FILM</p><h1>Find movies worth<br /><em>talking about.</em></h1><p className="intro">A shared space for curious movie lovers to discover, track, and celebrate great stories together.</p><button className="primary">Explore the community</button></section>
    <section id="discover" className="content"><div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>Tonight's picks</h2></div><span className="source">{data?.source === "ai" ? "AI powered" : "Community favorites"}</span></div>
      {error && <p className="error">{error}. Start the API to load recommendations.</p>}
      <div className="grid">{data?.recommendations.map((movie) => <article className="card" key={movie.id}><div className="poster">{movie.title.slice(0, 1)}</div><div className="card-body"><div className="meta">{movie.year} · {movie.genres.join(" / ")}</div><h3>{movie.title}</h3><p>{movie.reason}</p><span className="rating">★ {movie.averageRating.toFixed(1)}</span></div></article>)}</div>
    </section>
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
