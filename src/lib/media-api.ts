import { apiGet } from "./api";
import type {
  MovieSummary,
  TVSummary,
  PagedResponse,
  EnrichedMovie,
  EnrichedTV,
  MediaType,
  RatingListResponse,
} from "@/types/media";

interface SearchOptions {
  page?: number;
  year?: string;
  genreId?: string;
}

function buildSearchParams(
  title: string,
  { page = 1, year, genreId }: SearchOptions,
) {
  const params = new URLSearchParams({ title, page: String(page) });
  if (year?.trim()) params.set("year", year.trim());
  if (genreId?.trim()) params.set("genreId", genreId.trim());
  return params;
}

export function searchMovies(
  title: string,
  options: SearchOptions = {},
): Promise<PagedResponse<MovieSummary>> {
  const params = buildSearchParams(title, options);
  return apiGet<PagedResponse<MovieSummary>>(`/v1/media/movies?${params}`);
}

export function searchTV(
  title: string,
  options: SearchOptions = {},
): Promise<PagedResponse<TVSummary>> {
  const params = buildSearchParams(title, options);
  return apiGet<PagedResponse<TVSummary>>(`/v1/media/tv?${params}`);
}

export function popularMovies(page = 1): Promise<PagedResponse<MovieSummary>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiGet<PagedResponse<MovieSummary>>(
    `/v1/media/movies/popular?${params}`,
  );
}

export function popularTV(page = 1): Promise<PagedResponse<TVSummary>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiGet<PagedResponse<TVSummary>>(`/v1/media/tv/popular?${params}`);
}

export function searchMoviesByCast(
  castName: string,
  page = 1,
): Promise<PagedResponse<MovieSummary>> {
  const params = new URLSearchParams({
    name: castName,
    page: String(page),
  });
  return apiGet<PagedResponse<MovieSummary>>(
    `/v1/media/movies/by-cast?${params}`,
  );
}

export function searchTVByCast(
  castName: string,
  page = 1,
): Promise<PagedResponse<TVSummary>> {
  const params = new URLSearchParams({
    name: castName,
    page: String(page),
  });
  return apiGet<PagedResponse<TVSummary>>(`/v1/media/tv/by-cast?${params}`);
}

export async function popularMoviesMultiPage(
  pages = 4,
): Promise<MovieSummary[]> {
  const requests = Array.from({ length: pages }, (_, i) =>
    popularMovies(i + 1),
  );
  const results = await Promise.allSettled(requests);
  return results
    .filter(
      (r): r is PromiseFulfilledResult<PagedResponse<MovieSummary>> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value.results);
}

export async function popularTVMultiPage(pages = 4): Promise<TVSummary[]> {
  const requests = Array.from({ length: pages }, (_, i) => popularTV(i + 1));
  const results = await Promise.allSettled(requests);
  return results
    .filter(
      (r): r is PromiseFulfilledResult<PagedResponse<TVSummary>> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value.results);
}

export function enrichedMovie(id: string | number): Promise<EnrichedMovie> {
  return apiGet<EnrichedMovie>(`/v1/media/movies/${id}/enriched`);
}

export function enrichedTV(id: string | number): Promise<EnrichedTV> {
  return apiGet<EnrichedTV>(`/v1/media/tv/${id}/enriched`);
}

export function getTitleRatings(
  tmdbId: string | number,
  mediaType: MediaType,
  page = 1,
): Promise<RatingListResponse> {
  const params = new URLSearchParams({
    mediaType,
    page: String(page),
  });
  return apiGet<RatingListResponse>(`/v1/ratings/${tmdbId}?${params}`);
}
