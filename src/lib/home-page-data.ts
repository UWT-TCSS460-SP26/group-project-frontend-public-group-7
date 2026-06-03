import { unstable_cache } from "next/cache";

import { getPopularMovies, getPopularTVShows } from "@/lib/fetchAPI";
import { PUBLIC_MEDIA_REVALIDATE_SECONDS } from "@/lib/api";
import { groupByGenre, type GenreMediaItem } from "@/lib/group-media-by-genre";
import { MEDIA_GENRES } from "@/lib/media-filters";
import { popularMoviesMultiPage, popularTVMultiPage } from "@/lib/media-api";
import type { MovieCard, TVShowCard } from "@/types/backendObjects";

const HOME_EXPLORE_PAGES_PER_TYPE = 5;
const GENRE_ORDER = new Map<string, number>(
  MEDIA_GENRES.map((genre, index) => [genre.name, index]),
);

export interface HomePageMediaData {
  movies: MovieCard[];
  tvShows: TVShowCard[];
  genreRows: [string, GenreMediaItem[]][];
}

async function loadHomePageMedia(): Promise<HomePageMediaData> {
  const [movieRes, tvRes, browseMovies, browseTV] = await Promise.all([
    getPopularMovies(1),
    getPopularTVShows(1),
    popularMoviesMultiPage(HOME_EXPLORE_PAGES_PER_TYPE),
    popularTVMultiPage(HOME_EXPLORE_PAGES_PER_TYPE),
  ]);
  const grouped = groupByGenre(browseMovies, browseTV);
  const genreRows = [...grouped.entries()]
    .filter(([, items]) => items.length > 0)
    .sort(
      ([genreA], [genreB]) =>
        (GENRE_ORDER.get(genreA) ?? Number.MAX_SAFE_INTEGER) -
        (GENRE_ORDER.get(genreB) ?? Number.MAX_SAFE_INTEGER),
    );

  return {
    movies: movieRes.results,
    tvShows: tvRes.results,
    genreRows,
  };
}

export const getCachedHomePageMedia = unstable_cache(
  loadHomePageMedia,
  ["home-page-media-v2"],
  {
    revalidate: PUBLIC_MEDIA_REVALIDATE_SECONDS,
    tags: ["home-page-media"],
  },
);
