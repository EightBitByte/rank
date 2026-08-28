import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { Context, Next } from "hono";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { createEloRecord } from "@/server/db/elo";
import { createItem, getAllItems } from "@/server/db/items";
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
  const { env } = getCloudflareContext();
  const clientIp = c.req.header("CF-Connecting-IP") ?? "unknown";

  const { success } = await env.ALL_ITEMS_ENDPOINT_LIMITER.limit({
    key: clientIp,
  });
  if (!success) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  const db = drizzle(env.DB);
  const items = await getAllItems(db);

  return c.json(items);
});

app.post("/items/new", async (c) => {
  const { env } = getCloudflareContext();
  const authHeader = c.req.header("Authorization");
  if (authHeader !== `Bearer ${env.WORKER_SHARED_SECRET}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{
    title?: string;
    description?: string;
    category_id?: number;
  }>();

  const db = drizzle(env.DB);
  const item = await createItem(db, {
    title: body.title,
    description: body.description,
    category_id: body.category_id,
  });
  await createEloRecord(db, item.id);

  return c.json(item, 201);
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
