export interface MovieCard {
  id: number;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  rating: number;
  overview: string;
  genres: Array<{ id: number; name: string }>;
}

export interface MovieDetail extends MovieCard {
  tagline: string | null;
  releaseDate: string;
  runtimeMinutes: number | null;
  voteCount: number;
  backdropUrl: string | null;
  status: string;
  cast: Array<{ name: string; character: string; profileUrl: string | null }>;
  similar: MovieCard[];
}

export interface MovieListResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: MovieCard[];
}

export interface TVShowCard {
  id: number;
  title: string;
  firstAirDate: string;
  posterUrl: string | null;
  rating: number;
  overview: string;
  genres: Array<{ id: number; name: string }>;
}

export interface TVShowDetail extends TVShowCard {
  lastAirDate: string | null;
  status: string;
  totalSeasons: number;
  totalEpisodes: number;
  averageEpisodeMinutes: number | null;
  voteCount: number;
  backdropUrl: string | null;
  networks: Array<{ name: string; logoUrl: string | null }>;
  seasons: Array<{
    seasonNumber: number;
    episodeCount: number;
    airDate: string | null;
    posterUrl: string | null;
  }>;
  cast: Array<{ name: string; character: string; profileUrl: string | null }>;
  similar: TVShowCard[];
}

export interface TVShowListResponse {
  page: number;
  totalPages: number;
  totalResults: number;
  results: TVShowCard[];
}
