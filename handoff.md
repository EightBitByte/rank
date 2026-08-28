# Handoff: Merge standalone Hono API into Next.js repo

## Progress (2026-08-28)

Steps 1–3 done and verified end-to-end against local D1:

- `wrangler.jsonc`, `open-next.config.ts`, `next.config.ts` (with
  `initOpenNextCloudflareForDev()`) added to this repo.
- `db/`, `external/`, `lib/elo.ts` copied over from `ranking-api/src/`
  (fixed a pre-existing circular-reference type bug in `db/schema.ts` using
  `AnySQLiteColumn`, and a broken relative import in `lib/elo.ts`).
- `drizzle/migrations` copied and applied to local D1
  (`pnpm db:local-apply`) — all 6 migrations ran clean.
- `app/api/[[...route]]/route.ts` mounts the Hono app (same routes as
  `ranking-api/src/index.ts`: `/items/getAll`, `/items/new`, `/tmdb/*`).
  Bindings are pulled per-request via `getCloudflareContext().env` inside
  each handler (not `c.env` — that's not populated when Hono is mounted
  through `hono/vercel`'s `handle()` inside a Next.js route handler).
- Verified live via `next dev` + curl: auth-gated POST, D1 write, D1 read
  all round-tripped correctly.

Backend code was then consolidated under `server/` (`server/db/`,
`server/external/`, `server/lib/elo.ts`, `server/drizzle/`,
`server/drizzle.config.ts`) so it isn't scattered loose at repo root next
to the frontend — only `app/api/[[...route]]/route.ts` stays under `app/`,
since Next.js requires that. `wrangler.jsonc`'s `migrations_dir` and
`package.json`'s `db:generate` script were updated to match.

Step 5 (vote loop) done: added `GET /api/compare/next`
(`getComparisonPair`) and `POST /api/vote` (`logMatch`) — the standalone
API never actually exposed these despite `server/db/elo.ts` having the
logic, so this is a small feature addition, not just a migration. No RPC
client/vote UI built yet since there's no comparison screen in the
frontend today; only the backend endpoints exist so far, verified live
(elo/rd update correctly, match logged, 400 on bad body).

Step 4 (partially done, by choice — see below): `app/page.tsx` now pulls
the leaderboard and recent-activity sections from real D1 data via
`getLeaderboard`/`getRecentActivity` in `server/db/elo.ts` (direct
function calls, no HTTP round trip, server component). Verified live with
seeded categories/items/votes — correct ranks, elo, category tags, and
relative-time activity feed all rendered.

The Spotlight card and hero stats are still on the `lib/rank-data.ts`
mock, intentionally: Spotlight needs fields the schema doesn't store
(`addedDaysAgo`, `description`, `headToHeads`, `metadataSource`), and the
category system was generalized from a fixed 3-value enum
(MOVIES/GAMES/RESTAURANTS, each with a hardcoded color) to arbitrary
DB-driven category titles with hash-based tag colors
(`components/ui/category-tag.tsx`) — extending that to Spotlight is a
product decision, not something to infer silently.

Still open (step 6): delete the old `ranking-api` repo once parity is
confirmed, and — if wanted — a real vote/comparison screen, Spotlight
wired to real data (needs schema additions), and the category filter
pills wired to actually filter (currently decorative, `useState` only).


## Context

This is a personal ranking app (see `Spec.md` for full product spec) — pairwise
Elo comparisons across movies/games/restaurants, single global leaderboard,
gated admin portal, public read-only frontend. Stack: Next.js, Cloudflare D1,
Cloudflare Workers via OpenNext, Cloudflare Cron Triggers.

**Current state:** two separate repos/services — a standalone Hono app (API)
and a separate Next.js frontend, talking to each other over HTTP/CORS.

**Goal:** move the Hono app into the Next.js repo as a mounted route handler,
so both run in one process/deploy, and API calls that don't need to cross the
client/server boundary can skip HTTP entirely (direct function imports) while
still getting typed RPC access where it's genuinely needed (client-side
fetches).

Do not throw away Hono — mount it inside Next.js. Do not silently drop to
raw Next.js Route Handlers instead — Hono's middleware/validator ergonomics
are worth keeping, especially for the gated admin routes in Spec §5.

## Target structure

```
src/app/api/[[...route]]/route.ts   <- Hono app mounted here (catch-all)
src/db/                              <- drizzle schema + D1 access
src/lib/auth.ts                      <- admin session auth (hardcoded single account)
```

## Step-by-step

1. **Get one endpoint working end-to-end first.** Pick something simple and
   low-risk — the combined leaderboard read (Spec §6) is a good candidate
   since it's read-only.

   `src/app/api/[[...route]]/route.ts`:
   ```ts
   import { Hono } from "hono";
   import { handle } from "hono/vercel";
   import { getCloudflareContext } from "@opennextjs/cloudflare";
   import { drizzle } from "drizzle-orm/d1";

   const app = new Hono().basePath("/api");

   app.get("/leaderboard", async (c) => {
     const { env } = getCloudflareContext();
     const db = drizzle(env.DB);
     const items = await db.select().from(itemsTable).orderBy(/* elo desc */);
     return c.json(items);
   });

   export type AppType = typeof app; // <- used for typed RPC client later
   export const GET = handle(app);
   export const POST = handle(app);
   export const PATCH = handle(app);
   export const DELETE = handle(app);
   ```

2. **Binding access — the one real gotcha.** D1 is NOT available via
   `process.env` or a top-level import inside this route. It must be pulled
   per-request via `getCloudflareContext().env.DB` inside each handler.
   - After any wrangler config change, regenerate types:
     `wrangler types --env-interface CloudflareEnv`
   - For local dev, call `initOpenNextCloudflareForDev()` in `next.config.ts`
     so `next dev` can reach the binding without a full Workers build. Check
     current OpenNext docs (opennext.js.org/cloudflare/bindings) for the
     exact current API before wiring this up — this project is young and
     the adapter has moved fast.
   - Cloudflare also now supports **remote bindings** in local dev (connect
     to the real deployed D1 instance instead of local SQLite) via
     `experimental: { remoteBindings: true }` — optional, not required for v1.

3. **Migrate the admin API** (search source APIs, add-item, vote, undo —
   Spec §4, §5). This was the messiest CORS/secrets surface in the two-repo
   setup, so it's the biggest immediate win. Keep the admin auth
   (hardcoded single account, hashed password, session cookie) as Hono
   middleware guarding this sub-router.

4. **Wire the public leaderboard page to call server logic directly** —
   no RPC client needed here, since it's a server component. Import the
   same DB query functions the Hono handler uses (factor them out of the
   route file into `src/db/` or `src/lib/` so both the Hono route and the
   server component can call them without going through HTTP).

5. **Use Hono's typed RPC client only where there's real client-side
   interactivity** — specifically the ranking-session vote loop (Spec §4.5:
   pair appears → click → next pair appears), which needs client-side
   fetches:
   ```ts
   import { hc } from "hono/client";
   import type { AppType } from "@/app/api/[[...route]]/route";

   const client = hc<AppType>("/api");
   const res = await client.vote.$post({ json: { winnerId, loserId } });
   ```

6. **Delete the old standalone Hono repo** once parity is confirmed and the
   admin portal + public frontend are both fully served from the merged repo.

## Things to double check while implementing (don't assume from training data)

- Exact current `@opennextjs/cloudflare` API for `getCloudflareContext()` and
  `initOpenNextCloudflareForDev()` — confirm against current OpenNext docs,
  the adapter changes quickly.
- Whether `hono/vercel`'s `handle()` is still the right adapter for this
  OpenNext/Workers setup vs. a Workers-specific Hono adapter — verify current
  Hono docs.
- Cloudflare is also developing `vinext` (Vite-based Next.js reimplementation)
  as an alternative deployment path to OpenNext. Still beta — stick with
  OpenNext for this project, but worth being aware it exists.

## Out of scope for this migration task

Everything in Spec.md §8 (public voting, >3 categories, manual tiering,
tie/draw outcomes, full undo history, visible queue counters, R2 image
storage) — this handoff is purely about repo/architecture consolidation, not
product features.
