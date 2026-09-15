import { StrictMode, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Activity, FeedResponse, Movie, MovieDetails, RecommendationResponse, Review, User } from "@movie-community/shared";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const demoMovies: Movie[] = [
  { id: "movie-past-lives", title: "Past Lives", year: 2023, overview: "Two childhood friends reunite in New York for one fateful week.", posterUrl: "https://image.tmdb.org/t/p/w780/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/6DmgPTZYaug7QfvKNsU9B3z2QY.jpg", genres: ["Romance", "Drama"], averageRating: 4.7, ratingCount: 1240, runtime: 106, director: "Celine Song", cast: ["Greta Lee", "Teo Yoo", "John Magaro"] },
  { id: "movie-grand-budapest", title: "The Grand Budapest Hotel", year: 2014, overview: "A legendary concierge and his lobby boy become caught in a European adventure.", posterUrl: "https://image.tmdb.org/t/p/w780/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/n1y094tVDFATSzkTnFxoGZ1qNsG.jpg", genres: ["Comedy", "Drama"], averageRating: 4.6, ratingCount: 1890, runtime: 100, director: "Wes Anderson", cast: ["Ralph Fiennes", "Tony Revolori", "Saoirse Ronan"] },
  { id: "movie-arrival", title: "Arrival", year: 2016, overview: "A linguist works to communicate with visitors from another world.", posterUrl: "https://image.tmdb.org/t/p/w780/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/6dX9WFn3R9vV4a6O1fN9cQ2m5sY.jpg", genres: ["Science Fiction", "Drama"], averageRating: 4.5, ratingCount: 1632, runtime: 116, director: "Denis Villeneuve", cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"] },
  { id: "movie-moonlight", title: "Moonlight", year: 2016, overview: "A young man comes of age and finds his identity in Miami.", posterUrl: "https://image.tmdb.org/t/p/w780/4911T5FbJ9eD2Faz5Zdj8GgQm2Z.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/6wF2GdKq7N8Y9Z9eP4H5K6L7M8N.jpg", genres: ["Drama"], averageRating: 4.7, ratingCount: 2104, runtime: 111, director: "Barry Jenkins", cast: ["Mahershala Ali", "Trevante Rhodes", "Naomie Harris"] },
  { id: "movie-aftersun", title: "Aftersun", year: 2022, overview: "A daughter looks back on a holiday with her father and the memories that remain.", posterUrl: "https://image.tmdb.org/t/p/w780/evKzKX0Y1m7s6wH8qB5qR4o3w2P.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/9fE7D2cL5vH1bN3mQ8wR0tS6yU.jpg", genres: ["Drama"], averageRating: 4.6, ratingCount: 984, runtime: 101, director: "Charlotte Wells", cast: ["Paul Mescal", "Frankie Corio", "Celia Rowlson-Hall"] },
  { id: "movie-parasite", title: "Parasite", year: 2019, overview: "A cash-strapped family slowly works its way into the life of a wealthy household.", posterUrl: "https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/ApiEF3wP8Y2cW0zM4rT6vN1sQ9L.jpg", genres: ["Thriller", "Drama"], averageRating: 4.8, ratingCount: 2890, runtime: 132, director: "Bong Joon Ho", cast: ["Song Kang-ho", "Choi Woo-shik", "Park So-dam"] },
  { id: "movie-perfect-days", title: "Perfect Days", year: 2023, overview: "A quiet Tokyo routine opens into a series of small, luminous moments.", posterUrl: "https://image.tmdb.org/t/p/w780/1KJQ8e7R5y4T3u2i1o0p9N8m7L.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/2L6m0Q9v7K5s3R1t8Y4u6I0oP.jpg", genres: ["Drama"], averageRating: 4.4, ratingCount: 611, runtime: 124, director: "Wim Wenders", cast: ["Koji Yakusho", "Tokio Emoto", "Arisa Nakano"] },
  { id: "movie-holdovers", title: "The Holdovers", year: 2023, overview: "A curmudgeonly teacher and two students find an unexpected family over winter break.", posterUrl: "https://image.tmdb.org/t/p/w780/VHSzNBTwxV8vh7wylo7O9CLdac.jpg", backdropUrl: "https://image.tmdb.org/t/p/w1280/1G5oW1D7aT8s3R2v6Y9u4I0pL.jpg", genres: ["Comedy", "Drama"], averageRating: 4.5, ratingCount: 1394, runtime: 133, director: "Alexander Payne", cast: ["Paul Giamatti", "Da'Vine Joy Randolph", "Dominic Sessa"] }
];

const demoUser: User = { id: "demo-user", name: "Maya Chen", email: "maya@example.com", handle: "@mayachen", avatarUrl: null };

type View = "home" | "discover" | "watchlist" | "community";
type IconName = "home" | "compass" | "bookmark" | "users" | "search" | "bell" | "plus" | "arrow" | "close" | "chevron" | "spark" | "star" | "menu";

const iconPaths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" /><path d="M8 21h8" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.2 8.8-2.1 4.3-4.3 2.1 2.1-4.3 4.3-2.1Z" /></>,
  bookmark: <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" />,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  search: <><circle cx="10.8" cy="10.8" r="7.3" /><path d="m16.2 16.2 5 5" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, ...init });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? "Something went wrong");
  }
  return response.json() as Promise<T>;
}

function useHashView(): [View, (view: View) => void] {
  const read = () => {
    const value = window.location.hash.replace("#", "") as View;
    return ["home", "discover", "watchlist", "community"].includes(value) ? value : "home";
  };
  const [view, setView] = useState<View>(read);
  useEffect(() => {
    const onHashChange = () => setView(read());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const navigate = useCallback((next: View) => {
    window.location.hash = next;
    setView(next);
  }, []);
  return [view, navigate];
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ name, className = "" }: { name: string; className?: string }) {
  return <span className={`avatar ${className}`} aria-hidden="true">{initials(name)}</span>;
}

function Poster({ movie, className = "" }: { movie: Movie; className?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className={`poster ${className} poster-${movie.id}`}>
    {!failed && movie.posterUrl && <img src={movie.posterUrl} alt="" onError={() => setFailed(true)} />}
    <div className="poster-fallback"><span>{movie.title.slice(0, 1)}</span><small>{movie.genres[0]}</small></div>
    <div className="poster-shade" />
  </div>;
}

function Rating({ value, count, compact = false }: { value: number; count?: number; compact?: boolean }) {
  return <span className={`rating ${compact ? "rating-compact" : ""}`}><Icon name="star" size={compact ? 13 : 14} /> {value.toFixed(1)}{count && <small>({count.toLocaleString()})</small>}</span>;
}

function NavItem({ view, current, icon, label, onClick, count }: { view: View; current: View; icon: IconName; label: string; onClick: (view: View) => void; count?: number }) {
  return <button className={`nav-item ${current === view ? "active" : ""}`} onClick={() => onClick(view)}><Icon name={icon} /><span>{label}</span>{count ? <b>{count}</b> : null}</button>;
}

function Sidebar({ view, navigate, user, watchlistCount, onProfile }: { view: View; navigate: (view: View) => void; user: User; watchlistCount: number; onProfile: () => void }) {
  return <aside className="sidebar">
    <div className="brand"><span className="brand-mark">r</span><span>reel<span>room</span></span></div>
    <div className="side-label">LIBRARY</div>
    <nav className="side-nav">
      <NavItem view="home" current={view} icon="home" label="Home" onClick={navigate} />
      <NavItem view="discover" current={view} icon="compass" label="Discover" onClick={navigate} />
      <NavItem view="watchlist" current={view} icon="bookmark" label="Watchlist" onClick={navigate} count={watchlistCount} />
      <NavItem view="community" current={view} icon="users" label="Community" onClick={navigate} />
    </nav>
    <div className="side-divider" />
    <div className="side-label">YOUR MOODS</div>
    <button className="mood-item"><span className="mood-dot mood-yellow" />Something warm</button>
    <button className="mood-item"><span className="mood-dot mood-blue" />Quiet & reflective</button>
    <button className="mood-item"><span className="mood-dot mood-pink" />A little strange</button>
    <button className="new-list"><Icon name="plus" size={16} /> Create a list</button>
    <button className="profile-card" onClick={onProfile}><Avatar name={user.name} /><span><strong>{user.name}</strong><small>{user.handle}</small></span><Icon name="chevron" size={15} /></button>
  </aside>;
}

function Topbar({ view, onSearch, onProfile, onMenu }: { view: View; onSearch: (value: string) => void; onProfile: () => void; onMenu: () => void }) {
  const [value, setValue] = useState("");
  const labels: Record<View, string> = { home: "Home", discover: "Discover", watchlist: "Your watchlist", community: "Community" };
  const update = (next: string) => { setValue(next); onSearch(next); };
  return <header className="topbar"><button className="mobile-menu" onClick={onMenu}><Icon name="menu" /></button><div className="crumb"><span>reelroom</span><Icon name="chevron" size={13} /><strong>{labels[view]}</strong></div><label className="top-search"><Icon name="search" size={17} /><input value={value} onChange={(event) => update(event.target.value)} placeholder="Search films, people, lists" /><kbd>⌘ K</kbd></label><button className="icon-button notification"><Icon name="bell" size={19} /><i /></button><button className="top-avatar" onClick={onProfile}><Avatar name="Maya Chen" /></button></header>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-title"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}

function MovieCard({ movie, onOpen, saved, onToggle }: { movie: Movie; onOpen: (movie: Movie) => void; saved: boolean; onToggle: (movie: Movie) => void }) {
  return <article className="movie-card">
    <button className="movie-poster-button" onClick={() => onOpen(movie)} aria-label={`Open ${movie.title}`}><Poster movie={movie} className="movie-poster" /><span className="quick-rating"><Icon name="star" size={12} /> {movie.averageRating.toFixed(1)}</span></button>
    <div className="movie-card-copy"><div className="movie-meta"><span>{movie.year}</span><span className="meta-dot">·</span><span>{movie.genres[0]}</span></div><h3>{movie.title}</h3><div className="movie-card-footer"><Rating value={movie.averageRating} compact /><button className={`save-button ${saved ? "saved" : ""}`} onClick={() => onToggle(movie)} aria-label={saved ? `Remove ${movie.title} from watchlist` : `Save ${movie.title} to watchlist`}><Icon name="bookmark" size={15} /></button></div></div>
  </article>;
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div>{action && <button className="text-action" onClick={onAction}>{action}<Icon name="arrow" size={14} /></button>}</div>;
}

function ActivityRow({ item, onOpen }: { item: Activity; onOpen: (movie: Movie) => void }) {
  const verb = item.kind === "review" ? "reviewed" : item.kind === "rating" ? "rated" : "saved";
  return <article className="activity-row"><Avatar name={item.user.name} /><div className="activity-copy"><p><strong>{item.user.name}</strong> {verb} <button onClick={() => onOpen(item.movie)}>{item.movie.title}</button>{item.score && <span className="inline-stars"> · <Icon name="star" size={12} /> {item.score}.0</span>}</p>{item.body && <blockquote>“{item.body}”</blockquote>}<small>{timeAgo(item.createdAt)}</small></div><Poster movie={item.movie} className="activity-poster" /></article>;
}

function timeAgo(date: string) {
  const hours = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 3600000));
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function HomePage({ user, featured, recommendations, watchlist, activity, onOpen, onToggle, onNavigate, savedIds }: { user: User; featured: Movie; recommendations: Movie[]; watchlist: Movie[]; activity: Activity[]; onOpen: (movie: Movie) => void; onToggle: (movie: Movie) => void; onNavigate: (view: View) => void; savedIds: Set<string> }) {
  return <>
    <div className="welcome-row"><div><p className="eyebrow">TUESDAY, SEPTEMBER 15</p><h1>Good evening, {user.name.split(" ")[0]} <span>✦</span></h1><p className="welcome-copy">A few thoughtful picks for your next movie night.</p></div><button className="round-action" aria-label="Notifications"><Icon name="bell" size={18} /><i /></button></div>
    <section className="feature-card" style={{ "--backdrop": `url(${featured.backdropUrl ?? featured.posterUrl ?? ""})` } as React.CSSProperties}><div className="feature-overlay" /><div className="feature-copy"><span className="feature-kicker"><Icon name="spark" size={13} /> THE WEEKEND WATCH</span><h2>{featured.title}</h2><p className="feature-meta">{featured.year} <span>·</span> {featured.runtime} min <span>·</span> {featured.genres.join(" / ")}</p><p className="feature-description">{featured.overview}</p><div className="feature-actions"><button className="primary-button" onClick={() => onOpen(featured)}>View film <Icon name="arrow" size={15} /></button><button className="ghost-button" onClick={() => onToggle(featured)}><Icon name="bookmark" size={15} />{savedIds.has(featured.id) ? "Saved" : "Save to watchlist"}</button></div></div><div className="feature-credit"><span>CURATED BY</span><strong>reelroom editors</strong></div></section>
    <section className="content-section"><SectionHeading eyebrow="BASED ON YOUR TASTE" title="You might love these" action="See all" onAction={() => onNavigate("discover")} /><div className="movie-grid movie-grid-four">{recommendations.slice(0, 4).map((movie) => <MovieCard key={movie.id} movie={movie} onOpen={onOpen} saved={savedIds.has(movie.id)} onToggle={onToggle} />)}</div></section>
    <div className="home-columns"><section className="content-section activity-section"><SectionHeading eyebrow="FROM YOUR PEOPLE" title="What friends are watching" action="Open community" onAction={() => onNavigate("community")} /><div className="activity-list">{activity.slice(0, 3).map((item) => <ActivityRow key={item.id} item={item} onOpen={onOpen} />)}</div></section><section className="content-section watchlist-section"><SectionHeading eyebrow="KEEP EXPLORING" title="Your watchlist" action="View all" onAction={() => onNavigate("watchlist")} /><div className="watchlist-stack">{watchlist.slice(0, 3).map((movie) => <button className="watchlist-item" key={movie.id} onClick={() => onOpen(movie)}><Poster movie={movie} className="tiny-poster" /><span><strong>{movie.title}</strong><small>{movie.year} · {movie.genres[0]}</small></span><Icon name="chevron" size={15} /></button>)}{watchlist.length === 0 && <p className="empty-copy">Save a few films to keep them close.</p>}</div></section></div>
  </>;
}

function DiscoverPage({ movies, query, genre, setGenre, onOpen, onToggle, savedIds }: { movies: Movie[]; query: string; genre: string; setGenre: (genre: string) => void; onOpen: (movie: Movie) => void; onToggle: (movie: Movie) => void; savedIds: Set<string> }) {
  const genres = ["All", "Drama", "Comedy", "Romance", "Science Fiction", "Thriller"];
  return <><PageTitle eyebrow="THE CATALOG" title="Find your next favorite" description="A living shelf of films worth your time, from community classics to new discoveries." action={<button className="filter-button"><Icon name="spark" size={15} /> Taste quiz</button>} /><div className="discover-toolbar"><div className="large-search"><Icon name="search" size={18} /><input value={query} readOnly placeholder="Search by title, director, or mood" /></div><div className="genre-filters">{genres.map((item) => <button key={item} className={genre === (item === "All" ? "" : item) ? "active" : ""} onClick={() => setGenre(item === "All" ? "" : item)}>{item}</button>)}</div></div><div className="catalog-header"><p>{movies.length} films to explore</p><button className="sort-button">Most loved <Icon name="chevron" size={14} /></button></div>{movies.length ? <div className="movie-grid movie-grid-catalog">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} onOpen={onOpen} saved={savedIds.has(movie.id)} onToggle={onToggle} />)}</div> : <div className="empty-state"><span><Icon name="search" size={24} /></span><h3>No films found</h3><p>Try another title, director, or genre.</p></div>}</>;
}

function WatchlistPage({ movies, onOpen, onToggle, savedIds }: { movies: Movie[]; onOpen: (movie: Movie) => void; onToggle: (movie: Movie) => void; savedIds: Set<string> }) {
  return <><PageTitle eyebrow="YOUR LIBRARY" title="Watchlist" description="A personal queue of movies you’re curious about." action={<button className="filter-button"><Icon name="plus" size={15} /> Create a list</button>} /><div className="watchlist-summary"><div><span className="summary-number">{movies.length}</span><span>films saved</span></div><div><span className="summary-number">{movies.filter((movie) => movie.genres.includes("Drama")).length}</span><span>quiet nights in</span></div><div className="summary-note"><Icon name="spark" size={16} /> Your list is looking very thoughtful.</div></div>{movies.length ? <div className="movie-grid movie-grid-catalog">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} onOpen={onOpen} saved={savedIds.has(movie.id)} onToggle={onToggle} />)}</div> : <div className="empty-state"><span><Icon name="bookmark" size={24} /></span><h3>Your watchlist is waiting</h3><p>Save a film from Discover and it will appear here.</p></div>}</>;
}

function CommunityPage({ activity, onOpen }: { activity: Activity[]; onOpen: (movie: Movie) => void }) {
  return <><PageTitle eyebrow="THE PEOPLE YOU FOLLOW" title="Community" description="Find a little inspiration in what your people are watching, loving, and talking about." action={<button className="filter-button"><Icon name="users" size={15} /> Find people</button>} /><div className="community-layout"><section><div className="feed-tabs"><button className="active">Following</button><button>For you</button><button>Lists</button></div><div className="community-feed">{activity.concat(activity).slice(0, 5).map((item, index) => <ActivityRow key={`${item.id}-${index}`} item={item} onOpen={onOpen} />)}</div></section><aside className="people-card"><div className="eyebrow">PEOPLE TO FOLLOW</div><h3>Find your film people</h3><p>Movie taste is better when it’s shared.</p>{["Sofia Ramirez", "Theo Walker", "Nina Park"].map((name, index) => <div className="person-row" key={name}><Avatar name={name} /><span><strong>{name}</strong><small>{["@sofiar", "@theowatches", "@ninapark"][index]}</small></span><button>Follow</button></div>)}<button className="text-action full-action">See everyone <Icon name="arrow" size={14} /></button></aside></div></>;
}

function MovieModal({ movie, onClose, saved, onToggle, onRate, onReview }: { movie: MovieDetails; onClose: () => void; saved: boolean; onToggle: (movie: Movie) => void; onRate: (score: number) => Promise<void>; onReview: (body: string) => Promise<void> }) {
  const [rating, setRating] = useState(movie.userRating ?? 0);
  const [review, setReview] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const submitReview = async () => {
    if (!review.trim()) return;
    setSending(true); setError("");
    try { await onReview(review.trim()); setReview(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save review"); } finally { setSending(false); }
  };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="movie-modal" role="dialog" aria-modal="true" aria-label={movie.title}>
    <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button><div className="modal-hero" style={{ backgroundImage: `url(${movie.backdropUrl ?? movie.posterUrl ?? ""})` }}><div className="modal-hero-shade" /><div className="modal-poster-wrap"><Poster movie={movie} className="modal-poster" /></div></div>
    <div className="modal-body"><div className="modal-heading"><div><div className="eyebrow">{movie.genres.join(" · ")}</div><h2>{movie.title}</h2><p className="modal-meta">{movie.year} <span>·</span> {movie.runtime} min <span>·</span> Directed by {movie.director}</p></div><button className={`modal-save ${saved ? "saved" : ""}`} onClick={() => onToggle(movie)}><Icon name="bookmark" size={16} /> {saved ? "Saved" : "Save"}</button></div><p className="modal-overview">{movie.overview}</p><div className="detail-facts"><div><span>COMMUNITY RATING</span><Rating value={movie.averageRating} count={movie.ratingCount} /></div><div><span>STARRING</span><strong>{movie.cast?.slice(0, 3).join(", ")}</strong></div></div><div className="rate-box"><div><span className="eyebrow">YOUR TAKE</span><h3>How did it make you feel?</h3></div><div className="star-picker">{[1, 2, 3, 4, 5].map((score) => <button key={score} className={score <= rating ? "chosen" : ""} onClick={async () => { setRating(score); await onRate(score); }} aria-label={`Rate ${score} out of 5`}><Icon name="star" size={22} /></button>)}</div></div><div className="review-compose"><Avatar name="Maya Chen" /><div><textarea value={review} onChange={(event) => setReview(event.target.value)} placeholder="Share a thought about this film…" rows={3} /><div className="compose-footer"><span>{error}</span><button className="primary-button small-button" disabled={sending || !review.trim()} onClick={submitReview}>{sending ? "Saving…" : "Post review"}</button></div></div></div>{movie.reviews.length > 0 && <div className="review-list"><div className="eyebrow">RECENT THOUGHTS</div>{movie.reviews.slice(0, 3).map((item) => <ReviewRow key={item.id} review={item} />)}</div>}</div>
  </section></div>;
}

function ReviewRow({ review }: { review: Review }) {
  return <article className="review-row"><Avatar name={review.user.name} /><div><p><strong>{review.user.name}</strong><small>{timeAgo(review.createdAt)}</small></p><blockquote>“{review.body}”</blockquote></div></article>;
}

function ProfileModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(user.name);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="profile-modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button><div className="profile-large"><Avatar name={name} className="avatar-large" /><div><div className="eyebrow">YOUR PROFILE</div><h2>{name}</h2><p>{user.handle} · {user.email}</p></div></div><label className="field-label">Display name<input value={name} onChange={(event) => setName(event.target.value)} /></label><button className="primary-button profile-save" onClick={() => { onSave(name.trim() || user.name); onClose(); }}>Save changes <Icon name="arrow" size={15} /></button></section></div>;
}

function App() {
  const [view, navigate] = useHashView();
  const [user, setUser] = useState<User>(demoUser);
  const [movies, setMovies] = useState<Movie[]>(demoMovies);
  const [featured, setFeatured] = useState<Movie>(demoMovies[0]);
  const [watchlist, setWatchlist] = useState<Movie[]>([demoMovies[4], demoMovies[6]]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>(demoMovies.slice(1, 5));
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [toast, setToast] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [feed, recs, me] = await Promise.all([api<FeedResponse>("/api/feed"), api<RecommendationResponse>("/api/recommendations"), api<User>("/api/me")]);
      setMovies(feed.movies); setFeatured(feed.featured); setWatchlist(feed.watchlist); setActivity(feed.activity); setRecommendations(recs.recommendations); setUser(me); setOffline(false);
    } catch {
      setOffline(true);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2800); return () => window.clearTimeout(timer); }, [toast]);

  const savedIds = useMemo(() => new Set(watchlist.map((movie) => movie.id)), [watchlist]);
  const filteredMovies = useMemo(() => movies.filter((movie) => (!genre || movie.genres.includes(genre)) && (!query || `${movie.title} ${movie.overview} ${movie.director ?? ""}`.toLowerCase().includes(query.toLowerCase()))), [movies, genre, query]);

  const toggleWatchlist = async (movie: Movie) => {
    const saved = savedIds.has(movie.id);
    setWatchlist((current) => saved ? current.filter((item) => item.id !== movie.id) : [movie, ...current]);
    try {
      await api(`/api/watchlist/${movie.id}`, { method: saved ? "DELETE" : "POST", body: saved ? undefined : JSON.stringify({ userId: user.id }) });
      setToast(saved ? `${movie.title} removed from your watchlist` : `${movie.title} saved to your watchlist`);
    } catch { setWatchlist((current) => saved ? [movie, ...current] : current.filter((item) => item.id !== movie.id)); setToast("Could not update your watchlist"); }
  };

  const openMovie = async (movie: Movie) => {
    setSelectedMovie({ ...movie, reviews: [], watchlisted: savedIds.has(movie.id), userRating: null });
    try { setSelectedMovie(await api<MovieDetails>(`/api/movies/${movie.id}`)); } catch { /* The seeded UI remains usable without the API. */ }
  };

  const rateMovie = async (score: number) => {
    if (!selectedMovie) return;
    await api(`/api/ratings/${selectedMovie.id}`, { method: "POST", body: JSON.stringify({ score, userId: user.id }) });
    setSelectedMovie((current) => current ? { ...current, userRating: score } : current);
    setToast("Your rating was saved");
  };

  const reviewMovie = async (body: string) => {
    if (!selectedMovie) return;
    await api(`/api/reviews/${selectedMovie.id}`, { method: "POST", body: JSON.stringify({ body, userId: user.id }) });
    const updated = await api<MovieDetails>(`/api/movies/${selectedMovie.id}`);
    setSelectedMovie(updated); setToast("Your review was posted");
  };

  const navigateAndCloseMobile = (next: View) => { navigate(next); setMobileNav(false); };

  return <div className="app-shell"><Sidebar view={view} navigate={navigateAndCloseMobile} user={user} watchlistCount={watchlist.length} onProfile={() => setProfileOpen(true)} /><div className="main-column"><Topbar view={view} onSearch={setQuery} onProfile={() => setProfileOpen(true)} onMenu={() => setMobileNav((open) => !open)} /><main className="page-content">{offline && <div className="demo-banner"><Icon name="spark" size={15} /> Demo catalog active — start the API to persist ratings, reviews, and watchlists.</div>}{loading && <div className="loading-line"><span /> Loading your shelf…</div>}{view === "home" && <HomePage user={user} featured={featured} recommendations={recommendations} watchlist={watchlist} activity={activity} onOpen={openMovie} onToggle={toggleWatchlist} onNavigate={navigate} savedIds={savedIds} />}{view === "discover" && <DiscoverPage movies={filteredMovies} query={query} genre={genre} setGenre={setGenre} onOpen={openMovie} onToggle={toggleWatchlist} savedIds={savedIds} />}{view === "watchlist" && <WatchlistPage movies={watchlist} onOpen={openMovie} onToggle={toggleWatchlist} savedIds={savedIds} />}{view === "community" && <CommunityPage activity={activity} onOpen={openMovie} />}</main></div>{mobileNav && <div className="mobile-nav-overlay" onClick={() => setMobileNav(false)}><aside className="mobile-sidebar" onClick={(event) => event.stopPropagation()}><div className="brand"><span className="brand-mark">r</span><span>reel<span>room</span></span></div><nav className="side-nav"><NavItem view="home" current={view} icon="home" label="Home" onClick={navigateAndCloseMobile} /><NavItem view="discover" current={view} icon="compass" label="Discover" onClick={navigateAndCloseMobile} /><NavItem view="watchlist" current={view} icon="bookmark" label="Watchlist" onClick={navigateAndCloseMobile} count={watchlist.length} /><NavItem view="community" current={view} icon="users" label="Community" onClick={navigateAndCloseMobile} /></nav></aside></div>}{selectedMovie && <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} saved={savedIds.has(selectedMovie.id)} onToggle={toggleWatchlist} onRate={rateMovie} onReview={reviewMovie} />}{profileOpen && <ProfileModal user={user} onClose={() => setProfileOpen(false)} onSave={(name) => { setUser((current) => ({ ...current, name })); setToast("Profile updated"); }} />}{toast && <div className="toast"><Icon name="spark" size={15} />{toast}</div>}</div>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
