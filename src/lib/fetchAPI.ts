import {
  MovieListResponse,
  MovieDetail,
  TVShowListResponse,
  TVShowDetail,
} from "@/types/backendObjects";

const API_BASE = "https://tcss460-team-6-api.onrender.com";

export async function getPopularMovies(
  page: number = 1,
): Promise<MovieListResponse> {
  const response = await fetch(
    `${API_BASE}/v1/media/movies/popular?page=${page}`,
  );
  if (!response.ok)
    throw new Error(`Failed to fetch popular movies: ${response.statusText}`);
  return response.json();
}

export async function getMovieById(id: number): Promise<MovieDetail> {
  const response = await fetch(`${API_BASE}/v1/media/movies/${id}`);
  if (!response.ok)
    throw new Error(`Failed to fetch movie details: ${response.statusText}`);
  return response.json();
}

export async function getPopularTVShows(
  page: number = 1,
): Promise<TVShowListResponse> {
  const response = await fetch(`${API_BASE}/v1/media/tv/popular?page=${page}`);
  if (!response.ok)
    throw new Error(`Failed to fetch popular TV shows: ${response.statusText}`);
  return response.json();
}

export async function getTVShowById(id: number): Promise<TVShowDetail> {
  const response = await fetch(`${API_BASE}/v1/media/tv/${id}`);
  if (!response.ok)
    throw new Error(`Failed to fetch TV show details: ${response.statusText}`);
  return response.json();
}
