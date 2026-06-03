import {
  MovieListResponse,
  MovieDetail,
  TVShowListResponse,
  TVShowDetail,
} from "@/types/backendObjects";
import { API_BASE, PUBLIC_MEDIA_REVALIDATE_SECONDS } from "./api";

const PUBLIC_MEDIA_FETCH_OPTIONS = {
  next: { revalidate: PUBLIC_MEDIA_REVALIDATE_SECONDS },
} as const;

export async function getPopularMovies(
  page: number = 1,
): Promise<MovieListResponse> {
  const response = await fetch(
    `${API_BASE}/v1/media/movies/popular?page=${page}`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
  if (!response.ok)
    throw new Error(`Failed to fetch popular movies: ${response.statusText}`);
  return response.json();
}

export async function getMovieById(id: number): Promise<MovieDetail> {
  const response = await fetch(
    `${API_BASE}/v1/media/movies/${id}`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
  if (!response.ok)
    throw new Error(`Failed to fetch movie details: ${response.statusText}`);
  return response.json();
}

export async function getPopularTVShows(
  page: number = 1,
): Promise<TVShowListResponse> {
  const response = await fetch(
    `${API_BASE}/v1/media/tv/popular?page=${page}`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
  if (!response.ok)
    throw new Error(`Failed to fetch popular TV shows: ${response.statusText}`);
  return response.json();
}

export async function getTVShowById(id: number): Promise<TVShowDetail> {
  const response = await fetch(
    `${API_BASE}/v1/media/tv/${id}`,
    PUBLIC_MEDIA_FETCH_OPTIONS,
  );
  if (!response.ok)
    throw new Error(`Failed to fetch TV show details: ${response.statusText}`);
  return response.json();
}
