import {
  Avatar,
  Box,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import AppNavBar from "@/components/AppNavBar";
import CastFilmographyPagination from "@/components/CastFilmographyPagination";
import MediaCard from "@/components/MediaCard";
import { APP_CONFIG } from "@/config";
import { getMovieById, getTVShowById } from "@/lib/fetchAPI";
import { searchMoviesByCast, searchTVByCast } from "@/lib/media-api";
import type { MovieSummary, PagedResponse, TVSummary } from "@/types/media";

const TITLES_PER_PAGE = 12;
const API_TITLES_PER_PAGE = 20;

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{
    image?: string;
    moviePage?: string;
    tvPage?: string;
  }>;
}

function parsePageNumber(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

async function fetchCastCreditsPage<T extends { id: number }>(
  fetchPage: (page: number) => Promise<PagedResponse<T>>,
  requestedPage: number,
) {
  const firstPage = await fetchPage(1);
  const totalPages = Math.max(
    1,
    Math.ceil(firstPage.totalResults / TITLES_PER_PAGE),
  );
  const currentPage = Math.min(requestedPage, totalPages);

  if (firstPage.totalResults === 0) {
    return {
      currentPage,
      totalPages,
      totalResults: firstPage.totalResults,
      items: [] as T[],
    };
  }

  const startIndex = (currentPage - 1) * TITLES_PER_PAGE;
  const endIndex = Math.min(
    startIndex + TITLES_PER_PAGE,
    firstPage.totalResults,
  );
  const firstApiPage = Math.floor(startIndex / API_TITLES_PER_PAGE) + 1;
  const lastApiPage = Math.floor((endIndex - 1) / API_TITLES_PER_PAGE) + 1;
  const apiPages = Array.from(
    { length: lastApiPage - firstApiPage + 1 },
    (_, index) => firstApiPage + index,
  );
  const apiResponses = await Promise.allSettled(
    apiPages.map((apiPage) =>
      apiPage === 1 ? Promise.resolve(firstPage) : fetchPage(apiPage),
    ),
  );
  const fetchedItems = apiResponses
    .filter(
      (response): response is PromiseFulfilledResult<PagedResponse<T>> =>
        response.status === "fulfilled",
    )
    .flatMap((response) => response.value.results);
  const sliceStart = startIndex - (firstApiPage - 1) * API_TITLES_PER_PAGE;

  return {
    totalPages,
    currentPage,
    totalResults: firstPage.totalResults,
    items: fetchedItems.slice(sliceStart, sliceStart + TITLES_PER_PAGE),
  };
}

interface CastContext {
  name: string;
  character: string;
  profileUrl: string | null;
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase();
}

async function buildMovieCastContextMap(
  items: MovieSummary[],
  castName: string,
  castImage: string,
) {
  const normalizedName = normalizeName(castName);
  const entries = await Promise.allSettled(
    items.map(async (item) => {
      const detail = await getMovieById(item.id);
      const matchedCastMember = detail.cast.find(
        (member) => normalizeName(member.name) === normalizedName,
      );

      if (!matchedCastMember) {
        return null;
      }

      return [
        item.id,
        {
          name: matchedCastMember.name,
          character: matchedCastMember.character,
          profileUrl: matchedCastMember.profileUrl ?? (castImage || null),
        },
      ] as const;
    }),
  );

  return new Map(
    entries
      .filter(
        (
          entry,
        ): entry is PromiseFulfilledResult<
          readonly [number, CastContext] | null
        > => entry.status === "fulfilled",
      )
      .map((entry) => entry.value)
      .filter(
        (entry): entry is readonly [number, CastContext] => entry !== null,
      ),
  );
}

async function buildTVCastContextMap(
  items: TVSummary[],
  castName: string,
  castImage: string,
) {
  const normalizedName = normalizeName(castName);
  const entries = await Promise.allSettled(
    items.map(async (item) => {
      const detail = await getTVShowById(item.id);
      const matchedCastMember = detail.cast.find(
        (member) => normalizeName(member.name) === normalizedName,
      );

      if (!matchedCastMember) {
        return null;
      }

      return [
        item.id,
        {
          name: matchedCastMember.name,
          character: matchedCastMember.character,
          profileUrl: matchedCastMember.profileUrl ?? (castImage || null),
        },
      ] as const;
    }),
  );

  return new Map(
    entries
      .filter(
        (
          entry,
        ): entry is PromiseFulfilledResult<
          readonly [number, CastContext] | null
        > => entry.status === "fulfilled",
      )
      .map((entry) => entry.value)
      .filter(
        (entry): entry is readonly [number, CastContext] => entry !== null,
      ),
  );
}

function buildMediaHref(
  type: "movie" | "tv",
  id: number,
  castContext?: CastContext,
) {
  if (!castContext) {
    return `/media/${type}/${id}`;
  }

  const params = new URLSearchParams({
    castName: castContext.name,
    castCharacter: castContext.character,
    castImage: castContext.profileUrl ?? "",
  });

  return `/media/${type}/${id}?${params.toString()}`;
}

function ResultsGrid({
  items,
  type,
  castContexts,
}: {
  items: MovieSummary[] | TVSummary[];
  type: "movie" | "tv";
  castContexts?: Map<number, CastContext>;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(5, 1fr)",
          xl: "repeat(6, 1fr)",
        },
      }}
    >
      {items.map((item) => (
        <MediaCard
          key={`${type}-${item.id}`}
          type={type}
          item={item as MovieSummary & TVSummary}
          hrefOverride={buildMediaHref(
            type,
            item.id,
            castContexts?.get(item.id),
          )}
        />
      ))}
    </Box>
  );
}

export default async function CastFilmographyPage({
  params,
  searchParams,
}: PageProps) {
  const { name } = await params;
  const { image, moviePage, tvPage } = await searchParams;
  const castName = decodeURIComponent(name);
  const castImage = image ? decodeURIComponent(image) : "";

  const [paginatedMovies, paginatedTVShows] = await Promise.all([
    fetchCastCreditsPage(
      (page) => searchMoviesByCast(castName, page),
      parsePageNumber(moviePage),
    ),
    fetchCastCreditsPage(
      (page) => searchTVByCast(castName, page),
      parsePageNumber(tvPage),
    ),
  ]);
  const [movieCastContexts, tvCastContexts] = await Promise.all([
    buildMovieCastContextMap(paginatedMovies.items, castName, castImage),
    buildTVCastContextMap(paginatedTVShows.items, castName, castImage),
  ]);
  const totalTitles =
    paginatedMovies.totalResults + paginatedTVShows.totalResults;

  return (
    <>
      <AppNavBar callbackUrl={`${APP_CONFIG.routes.search}`} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Avatar
              src={castImage || undefined}
              alt={castName}
              sx={{
                width: { xs: 84, md: 104 },
                height: { xs: 84, md: 104 },
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: { xs: 28, md: 36 },
                fontWeight: 700,
              }}
            >
              {castName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("")}
            </Avatar>

            <Box>
              <Typography
                variant="overline"
                sx={{ color: "primary.main", letterSpacing: 1.2 }}
              >
                Cast Filmography
              </Typography>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {castName}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {totalTitles.toLocaleString()} title
                {totalTitles !== 1 ? "s" : ""} found across movies and TV shows.
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="primary.main"
            >
              Movies
            </Typography>
            {paginatedMovies.totalResults > 0 ? (
              <>
                <ResultsGrid
                  items={paginatedMovies.items}
                  type="movie"
                  castContexts={movieCastContexts}
                />
                {paginatedMovies.totalPages > 1 && (
                  <CastFilmographyPagination
                    currentPage={paginatedMovies.currentPage}
                    pageParam="moviePage"
                    totalResults={paginatedMovies.totalResults}
                    totalPages={paginatedMovies.totalPages}
                  />
                )}
              </>
            ) : (
              <Typography color="text.secondary">
                No movie credits found.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="primary.main"
            >
              TV Shows
            </Typography>
            {paginatedTVShows.totalResults > 0 ? (
              <>
                <ResultsGrid
                  items={paginatedTVShows.items}
                  type="tv"
                  castContexts={tvCastContexts}
                />
                {paginatedTVShows.totalPages > 1 && (
                  <CastFilmographyPagination
                    currentPage={paginatedTVShows.currentPage}
                    pageParam="tvPage"
                    totalResults={paginatedTVShows.totalResults}
                    totalPages={paginatedTVShows.totalPages}
                  />
                )}
              </>
            ) : (
              <Typography color="text.secondary">
                No TV credits found.
              </Typography>
            )}
          </Box>
        </Stack>
      </Container>
    </>
  );
}
