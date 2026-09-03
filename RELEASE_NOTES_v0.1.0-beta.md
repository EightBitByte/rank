v0.1.0-beta

First beta release of Rank. Core voting and leaderboard experience, plus a full admin panel for managing items and categories.

Highlights

- Head-to-head voting loop wired up to real D1 data, with a live leaderboard.
- Admin panel: add items, run matchups, and manage/delete existing entries.
- Admin authentication with rate limiting.
- Category management: create, edit, color, and delete categories directly from the admin panel.
- Items now support poster/preview images in both the admin panel and public leaderboard.
- Placeholder thumbnails for items without artwork.

Fixes

- Manage panel category chips now correctly reflect the category's assigned color instead of a static hash-based color.
- Forced dynamic rendering on the home and admin routes to avoid stale cached data.
- Header version now stays in sync with the package version.

Chores

- Dropped Hono in favor of native server actions; deduped server/DB access and placeholder thumbnail logic.
- Footer now attributes LastFM as a data source alongside TMDb, IGDB, and Google Places.

Known limitations

- Beta release: expect rough edges in admin UX and possible schema changes before v0.1.0 stable.

Full changelog: initial commit through this tag.
