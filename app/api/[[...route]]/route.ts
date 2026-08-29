import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Context, Next } from "hono";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { addManualItemAction, voteAction } from "@/app/admin/actions";
import { getDb } from "@/server/db/crud";
import { getComparisonPair, getMatchCount } from "@/server/db/elo";
import { getAllItems } from "@/server/db/items";
import {
  getMovieDetailsById,
  getTVShowDetailsById,
  searchMoviesByTitle,
  searchTVShowsByTitle,
} from "@/server/external/tmdb";

const app = new Hono().basePath("/api");

const requireSharedSecret = async (c: Context, next: Next) => {
  const { env } = getCloudflareContext();
  const authHeader = c.req.header("Authorization");
  if (authHeader !== `Bearer ${env.WORKER_SHARED_SECRET}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};

function requireQuery(c: Context, name: string): string | Response {
  const value = c.req.query(name);
  if (!value) {
    return c.json({ error: `Missing "${name}" query parameter.` }, 400);
  }
  return value;
}

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// --------------- Items ---------------
app.get("/items/getAll", async (c) => {
  const { db, env } = getDb();
  const clientIp = c.req.header("CF-Connecting-IP") ?? "unknown";

  const { success } = await env.ALL_ITEMS_ENDPOINT_LIMITER.limit({
    key: clientIp,
  });
  if (!success) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const items = await getAllItems(db);

  return c.json(items);
});

app.use("/items/new", requireSharedSecret);
app.post("/items/new", async (c) => {
  const body = await c.req.json<{
    title?: string;
    description?: string;
    category_id?: number;
  }>();

  const item = await addManualItemAction({
    title: body.title ?? "",
    categoryId: body.category_id ?? null,
    description: body.description,
  });

  return c.json(item, 201);
});

app.get("/matches/count", async (c) => {
  const { db } = getDb();
  const count = await getMatchCount(db);

  return c.json(count, 200);
});

// --------------- Comparisons ---------------
app.use("/compare/next", requireSharedSecret);
app.get("/compare/next", async (c) => {
  const { db } = getDb();
  const pair = await getComparisonPair(db);

  if (!pair) {
    return c.json({ error: "Not enough items to compare." }, 409);
  }

  return c.json({ data: pair }, 200);
});

app.use("/vote", requireSharedSecret);
app.post("/vote", async (c) => {
  const body = await c.req.json<{ winnerId?: number; loserId?: number }>();

  if (typeof body.winnerId !== "number" || typeof body.loserId !== "number") {
    return c.json(
      { error: '"winnerId" and "loserId" must both be numbers.' },
      400,
    );
  }

  await voteAction(body.winnerId, body.loserId);

  return c.json({ ok: true }, 200);
});

// --------------- External ---------------
app.use("/tmdb/*", requireSharedSecret);

app.get("/tmdb/movies/search", async (c) => {
  const { env } = getCloudflareContext();
  const titleQuery = requireQuery(c, "title");
  if (titleQuery instanceof Response) return titleQuery;

  const data = await searchMoviesByTitle({
    apiKey: env.TMDB_KEY,
    title: titleQuery,
  });

  return c.json({ data }, 200);
});

app.get("/tmdb/tv/search", async (c) => {
  const { env } = getCloudflareContext();
  const titleQuery = requireQuery(c, "title");
  if (titleQuery instanceof Response) return titleQuery;

  const data = await searchTVShowsByTitle({
    apiKey: env.TMDB_KEY,
    title: titleQuery,
  });

  return c.json({ data }, 200);
});

app.get("/tmdb/movies/details", async (c) => {
  const { env } = getCloudflareContext();
  const idQuery = requireQuery(c, "id");
  if (idQuery instanceof Response) return idQuery;

  const id = Number(idQuery);
  if (Number.isNaN(id)) {
    return c.json({ error: '"id" query parameter must be a number.' }, 400);
  }

  const data = await getMovieDetailsById({ apiKey: env.TMDB_KEY, id });

  return c.json({ data }, 200);
});

app.get("/tmdb/tv/details", async (c) => {
  const { env } = getCloudflareContext();
  const idQuery = requireQuery(c, "id");
  if (idQuery instanceof Response) return idQuery;

  const id = Number(idQuery);
  if (Number.isNaN(id)) {
    return c.json({ error: '"id" query parameter must be a number.' }, 400);
  }

  const data = await getTVShowDetailsById({ apiKey: env.TMDB_KEY, id });

  return c.json({ data }, 200);
});

export type AppType = typeof app;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
