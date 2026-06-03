import { unstable_cache } from "next/cache";

import { getPopularMovies, getPopularTVShows } from "@/lib/fetchAPI";
import { PUBLIC_MEDIA_REVALIDATE_SECONDS } from "@/lib/api";
import { groupByGenre, type GenreMediaItem } from "@/lib/group-media-by-genre";
import { popularMoviesMultiPage, popularTVMultiPage } from "@/lib/media-api";
import type { MovieCard, TVShowCard } from "@/types/backendObjects";

const HOME_EXPLORE_PAGES_PER_TYPE = 3;
const HOME_EXPLORE_ROW_LIMIT = 8;

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
    .filter(([, items]) => items.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, HOME_EXPLORE_ROW_LIMIT);

  return {
    movies: movieRes.results,
    tvShows: tvRes.results,
    genreRows,
  };
}

export const getCachedHomePageMedia = unstable_cache(
  loadHomePageMedia,
  ["home-page-media-v1"],
  {
    revalidate: PUBLIC_MEDIA_REVALIDATE_SECONDS,
    tags: ["home-page-media"],
  },
);
