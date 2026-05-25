import { apiGet } from './api';
import type { MovieSummary, TVSummary, PagedResponse, EnrichedMovie, EnrichedTV } from '@/types/media';

export function searchMovies(title: string, page = 1): Promise<PagedResponse<MovieSummary>> {
  const params = new URLSearchParams({ title, page: String(page) });
  return apiGet<PagedResponse<MovieSummary>>(`/v1/media/movies?${params}`);
}

export function searchTV(title: string, page = 1): Promise<PagedResponse<TVSummary>> {
  const params = new URLSearchParams({ title, page: String(page) });
  return apiGet<PagedResponse<TVSummary>>(`/v1/media/tv?${params}`);
}

export function popularMovies(page = 1): Promise<PagedResponse<MovieSummary>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiGet<PagedResponse<MovieSummary>>(`/v1/media/movies/popular?${params}`);
}

export function popularTV(page = 1): Promise<PagedResponse<TVSummary>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiGet<PagedResponse<TVSummary>>(`/v1/media/tv/popular?${params}`);
}

export async function popularMoviesMultiPage(pages = 4): Promise<MovieSummary[]> {
  const requests = Array.from({ length: pages }, (_, i) => popularMovies(i + 1));
  const results = await Promise.allSettled(requests);
  return results
    .filter((r): r is PromiseFulfilledResult<PagedResponse<MovieSummary>> => r.status === 'fulfilled')
    .flatMap((r) => r.value.results);
}

export async function popularTVMultiPage(pages = 4): Promise<TVSummary[]> {
  const requests = Array.from({ length: pages }, (_, i) => popularTV(i + 1));
  const results = await Promise.allSettled(requests);
  return results
    .filter((r): r is PromiseFulfilledResult<PagedResponse<TVSummary>> => r.status === 'fulfilled')
    .flatMap((r) => r.value.results);
}

export function enrichedMovie(id: string | number): Promise<EnrichedMovie> {
  return apiGet<EnrichedMovie>(`/v1/media/movies/${id}/enriched`);
}

export function enrichedTV(id: string | number): Promise<EnrichedTV> {
  return apiGet<EnrichedTV>(`/v1/media/tv/${id}/enriched`);
}
