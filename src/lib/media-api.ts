import { apiGet, PUBLIC_MEDIA_REVALIDATE_SECONDS } from "./api";
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

const PUBLIC_MEDIA_FETCH_OPTIONS = {
  next: { revalidate: PUBLIC_MEDIA_REVALIDATE_SECONDS },
} as const;

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
  return apiGet<PagedResponse<MovieSummary>>(
    `/v1/media/movies?${params}`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
}

export function searchTV(
  title: string,
  options: SearchOptions = {},
): Promise<PagedResponse<TVSummary>> {
  const params = buildSearchParams(title, options);
  return apiGet<PagedResponse<TVSummary>>(
    `/v1/media/tv?${params}`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
}

export function popularMovies(page = 1): Promise<PagedResponse<MovieSummary>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiGet<PagedResponse<MovieSummary>>(
    `/v1/media/movies/popular?${params}`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
}

export function popularTV(page = 1): Promise<PagedResponse<TVSummary>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiGet<PagedResponse<TVSummary>>(
    `/v1/media/tv/popular?${params}`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
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
    PUBLIC_MEDIA_FETCH_OPTIONS,
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
  return apiGet<PagedResponse<TVSummary>>(
    `/v1/media/tv/by-cast?${params}`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
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
  return apiGet<EnrichedMovie>(
    `/v1/media/movies/${id}/enriched`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
}

export function enrichedTV(id: string | number): Promise<EnrichedTV> {
  return apiGet<EnrichedTV>(
    `/v1/media/tv/${id}/enriched`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
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
