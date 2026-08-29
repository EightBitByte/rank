import type { z } from "zod";
import {
  type MovieDetailsResponse,
  movieDetailsResponseSchema,
  type SearchMovieResponse,
  type SearchTVShowsResponse,
  searchMovieResponseSchema,
  searchTVShowsResponseSchema,
  type TVShowsDetailsResponse,
  tvShowsDetailsResponseSchema,
} from "./schema";

async function fetchTmdb<T extends z.ZodTypeAny>(
  route: URL,
  apiKey: string,
  schema: T,
): Promise<z.infer<T>> {
  const result = await fetch(route.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!result.ok)
    throw new Error(
      `TMDB request failed: ${result.status} ${await result.text()}`,
    );

  const data = (await result.json()) as Record<string, unknown>;
  if (data.error)
    throw new Error(`TMDB data error: ${data.error} ${data.message}`);

  return schema.parse(data);
}

export async function searchMoviesByTitle({
  apiKey,
  title,
}: {
  apiKey: string;
  title: string;
}): Promise<SearchMovieResponse> {
  const route = new URL("https://api.themoviedb.org/3/search/movie");
  route.searchParams.set("query", title);

  return fetchTmdb(route, apiKey, searchMovieResponseSchema);
}

export async function searchTVShowsByTitle({
  apiKey,
  title,
}: {
  apiKey: string;
  title: string;
}): Promise<SearchTVShowsResponse> {
  const route = new URL("https://api.themoviedb.org/3/search/tv");
  route.searchParams.set("query", title);

  return fetchTmdb(route, apiKey, searchTVShowsResponseSchema);
}

export async function getMovieDetailsById({
  apiKey,
  id,
}: {
  apiKey: string;
  id: number;
}): Promise<MovieDetailsResponse> {
  const route = new URL(`https://api.themoviedb.org/3/movie/${id}`);

  return fetchTmdb(route, apiKey, movieDetailsResponseSchema);
}

export async function getTVShowDetailsById({
  apiKey,
  id,
}: {
  apiKey: string;
  id: number;
}): Promise<TVShowsDetailsResponse> {
  const route = new URL(`https://api.themoviedb.org/3/tv/${id}`);

  return fetchTmdb(route, apiKey, tvShowsDetailsResponseSchema);
}
