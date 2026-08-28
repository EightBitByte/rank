import { z } from "zod";

// --------------- TMDB ---------------
const searchResultBaseSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  genre_ids: z.array(z.number()),
  id: z.number(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export const searchMovieResponseSchema = z.object({
  page: z.number(),
  results: z.array(
    searchResultBaseSchema.extend({
      release_date: z.string(),
      title: z.string(),
      video: z.boolean(),
    }),
  ),
  total_pages: z.number(),
  total_results: z.number(),
});
export type SearchMovieResponse = z.infer<typeof searchMovieResponseSchema>;

export const searchTVShowsResponseSchema = z.object({
  page: z.number(),
  results: z.array(
    searchResultBaseSchema.extend({
      first_air_date: z.string(),
      name: z.string(),
    }),
  ),
  total_pages: z.number(),
  total_results: z.number(),
});
export type SearchTVShowsResponse = z.infer<typeof searchTVShowsResponseSchema>;

const detailsBaseSchema = z.object({
  backdrop_path: z.string().nullable(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  homepage: z.string().nullable(),
  id: z.number(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export const movieDetailsResponseSchema = detailsBaseSchema.extend({
  imdb_id: z.string(),
  origin_country: z.array(z.string()),
  original_title: z.string(),
  release_date: z.string(),
  runtime: z.number(),
  title: z.string(),
  video: z.boolean(),
});
export type MovieDetailsResponse = z.infer<typeof movieDetailsResponseSchema>;

export const tvShowsDetailsResponseSchema = detailsBaseSchema.extend({
  first_air_date: z.string(),
  name: z.string(),
});
export type TVShowsDetailsResponse = z.infer<
  typeof tvShowsDetailsResponseSchema
>;
