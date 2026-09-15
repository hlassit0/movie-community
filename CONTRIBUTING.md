# Contributing

## Suggested workstreams

1. **Authentication and profiles:** sessions, profile settings, avatars, privacy.
2. **Movie catalog:** TMDB integration, search, movie detail pages, caching.
3. **Social graph:** follows, activity feed, comments, reactions.
4. **Tracking:** watchlist, watched history, ratings, reviews, custom lists.
5. **Recommendations:** preference collection, prompt design, evaluation, feedback loop.
6. **Frontend experience:** navigation, responsive layouts, loading/error states.
7. **Quality and operations:** tests, validation, logging, CI, deployment.

Keep API contracts in `packages/shared` when a response is consumed by both applications. Add migrations for every schema change and never commit secrets.
