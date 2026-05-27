import { Box, Container, Divider, Stack, Typography } from "@mui/material";

import AppNavBar from "@/components/AppNavBar";
import { searchMovies, searchTV } from "@/lib/media-api";
import SearchForm from "@/components/SearchForm";
import MediaCard from "@/components/MediaCard";
import SearchPagination from "@/components/SearchPagination";
import { apiGet, ApiError } from "@/lib/api";
import { auth } from "@/lib/auth";
import { APP_CONFIG } from "@/config";
import { getEffectiveUser } from "@/lib/dev-user";
import type { MovieSummary, TVDetail, TVSummary } from "@/types/media";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    movies?: string;
    tv?: string;
    year?: string;
    genreId?: string;
  }>;
}

type CombinedResult =
  | (MovieSummary & { _type: "movie" })
  | (TVSummary & { _type: "tv" });

const FILTERED_PAGE_SIZE = 20;

function interleaveResults(
  movies: Array<MovieSummary & { _type: "movie" }>,
  tv: Array<TVSummary & { _type: "tv" }>,
): CombinedResult[] {
  const combined: CombinedResult[] = [];
  const len = Math.max(movies.length, tv.length);

  for (let i = 0; i < len; i++) {
    if (i < movies.length) combined.push(movies[i]);
    if (i < tv.length) combined.push(tv[i]);
  }

  return combined;
}

function dedupeCombinedResults(items: CombinedResult[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item._type}-${item.id}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function matchesFilters(
  item: MovieSummary | TVSummary,
  query: string,
  year: string,
  genreId: string,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery =
    !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery);
  const matchesYear =
    !year.trim() ||
    ("releaseYear" in item
      ? String(item.releaseYear ?? "") === year.trim()
      : (item.firstAirDate ?? "").slice(0, 4) === year.trim());
  const matchesGenre =
    !genreId.trim() ||
    item.genres.some((genre) => String(genre.id) === genreId.trim());

  return matchesQuery && matchesYear && matchesGenre;
}

async function fetchFilteredMovieResults(
  query: string,
  year: string,
  genreId: string,
) {
  const firstPage = await searchMovies(query, { page: 1, year, genreId });
  const pages = Array.from(
    { length: Math.max(firstPage.totalPages - 1, 0) },
    (_, index) => index + 2,
  );
  const remainingPages = await Promise.allSettled(
    pages.map((page) => searchMovies(query, { page, year, genreId })),
  );

  const allResults = [
    ...firstPage.results,
    ...remainingPages
      .filter(
        (result): result is PromiseFulfilledResult<typeof firstPage> =>
          result.status === "fulfilled",
      )
      .flatMap((result) => result.value.results),
  ];

  return allResults.filter((item) =>
    matchesFilters(item, query, year, genreId),
  );
}

async function fetchFilteredTVResults(
  query: string,
  year: string,
  genreId: string,
) {
  const firstPage = await searchTV(query, { page: 1, year, genreId });
  const pages = Array.from(
    { length: Math.max(firstPage.totalPages - 1, 0) },
    (_, index) => index + 2,
  );
  const remainingPages = await Promise.allSettled(
    pages.map((page) => searchTV(query, { page, year, genreId })),
  );

  const allResults = [
    ...firstPage.results,
    ...remainingPages
      .filter(
        (result): result is PromiseFulfilledResult<typeof firstPage> =>
          result.status === "fulfilled",
      )
      .flatMap((result) => result.value.results),
  ];

  return allResults.filter((item) =>
    matchesFilters(item, query, year, genreId),
  );
}

export default async function SearchPage({ searchParams }: PageProps) {
  const session = await auth();
  const user = getEffectiveUser(session?.user);
  const {
    q,
    page = "1",
    movies,
    tv,
    year = "",
    genreId = "",
  } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const includeMovies =
    movies !== "0" && movies !== "false" && (movies === "1" || tv !== "1");
  const includeTV =
    tv !== "0" && tv !== "false" && (tv === "1" || movies !== "1");
  const hasCriteria = includeMovies || includeTV;
  const hasSearchInput =
    Boolean(q?.trim()) || Boolean(year.trim()) || Boolean(genreId.trim());
  const needsClientSideFiltering =
    Boolean(year.trim()) || Boolean(genreId.trim());

  const results: CombinedResult[] = [];
  let totalPages = 0;
  let totalResults = 0;
  let searchError: string | null = null;

  if (hasSearchInput) {
    try {
      if (needsClientSideFiltering) {
        const [movieResults, tvResults] = await Promise.allSettled([
          includeMovies
            ? fetchFilteredMovieResults(q?.trim() ?? "", year, genreId)
            : Promise.resolve([]),
          includeTV
            ? fetchFilteredTVResults(q?.trim() ?? "", year, genreId)
            : Promise.resolve([]),
        ]);

        const movies =
          includeMovies &&
          movieResults.status === "fulfilled" &&
          movieResults.value
            ? movieResults.value.map((item) => ({
                ...item,
                _type: "movie" as const,
              }))
            : [];
        const tv =
          includeTV && tvResults.status === "fulfilled" && tvResults.value
            ? tvResults.value.map((item) => ({
                ...item,
                _type: "tv" as const,
              }))
            : [];

        const combinedResults = dedupeCombinedResults(
          interleaveResults(movies, tv),
        );
        totalResults = combinedResults.length;
        totalPages = Math.max(
          1,
          Math.ceil(combinedResults.length / FILTERED_PAGE_SIZE),
        );
        results.push(
          ...combinedResults.slice(
            (pageNum - 1) * FILTERED_PAGE_SIZE,
            pageNum * FILTERED_PAGE_SIZE,
          ),
        );

        if (
          (!includeMovies || movieResults.status === "rejected") &&
          (!includeTV || tvResults.status === "rejected")
        ) {
          searchError = "Search failed. Try again.";
        }
      } else {
        const [moviesData, tvData] = await Promise.allSettled([
          includeMovies
            ? searchMovies(q?.trim() ?? "", { page: pageNum, year, genreId })
            : Promise.resolve(null),
          includeTV
            ? searchTV(q?.trim() ?? "", { page: pageNum, year, genreId })
            : Promise.resolve(null),
        ]);

        const movies =
          includeMovies && moviesData.status === "fulfilled" && moviesData.value
            ? moviesData.value.results.map((m) => ({
                ...m,
                _type: "movie" as const,
              }))
            : [];
        const tv =
          includeTV && tvData.status === "fulfilled" && tvData.value
            ? tvData.value.results.map((t) => ({ ...t, _type: "tv" as const }))
            : [];

        results.push(...dedupeCombinedResults(interleaveResults(movies, tv)));
        totalResults =
          (includeMovies &&
          moviesData.status === "fulfilled" &&
          moviesData.value
            ? moviesData.value.totalResults
            : 0) +
          (includeTV && tvData.status === "fulfilled" && tvData.value
            ? tvData.value.totalResults
            : 0);
        totalPages = Math.max(
          includeMovies && moviesData.status === "fulfilled" && moviesData.value
            ? moviesData.value.totalPages
            : 0,
          includeTV && tvData.status === "fulfilled" && tvData.value
            ? tvData.value.totalPages
            : 0,
        );

        if (
          (!includeMovies || moviesData.status === "rejected") &&
          (!includeTV || tvData.status === "rejected")
        ) {
          searchError = "Search failed. Try again.";
        }
      }

      if (!hasCriteria) {
        searchError = "Select at least one category to search.";
      }
    } catch (e) {
      searchError =
        e instanceof ApiError
          ? `API error ${e.status}: ${e.statusText}`
          : "Search failed. Try again.";
    }
  }

  const visibleTVResults = results.filter(
    (item): item is TVSummary & { _type: "tv" } => item._type === "tv",
  );
  const tvSeasonCounts = new Map<number, number | null>();

  if (visibleTVResults.length > 0) {
    const seasonDetails = await Promise.allSettled(
      visibleTVResults.map((item) =>
        apiGet<TVDetail>(`/v1/media/tv/${item.id}`),
      ),
    );

    visibleTVResults.forEach((item, index) => {
      const detail = seasonDetails[index];
      tvSeasonCounts.set(
        item.id,
        detail.status === "fulfilled" ? detail.value.totalSeasons : null,
      );
    });
  }

  return (
    <>
      <AppNavBar callbackUrl={APP_CONFIG.routes.search} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* ── Search bar ── */}
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              fontWeight="bold"
            >
              Search
            </Typography>
            <SearchForm
              initialQ={q ?? ""}
              initialMovies={includeMovies}
              initialTV={includeTV}
              initialYear={year}
              initialGenreId={genreId}
              signInCallbackUrl={!user ? APP_CONFIG.routes.search : undefined}
            />
          </Box>

          <Divider />

          {/* ── Search results ── */}
          {hasSearchInput && (
            <>
              {searchError ? (
                <Typography color="error">{searchError}</Typography>
              ) : (
                <>
                  <Typography color="text.secondary">
                    {totalResults.toLocaleString()} result
                    {totalResults !== 1 ? "s" : ""}
                    {q?.trim() ? ` for “${q.trim()}”` : " for your filters"}
                  </Typography>

                  {results.length === 0 ? (
                    <Typography>No results found.</Typography>
                  ) : (
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
                      {results.map((item) => (
                        <MediaCard
                          key={`${item._type}-${item.id}`}
                          type={item._type}
                          item={item as unknown as MovieSummary & TVSummary}
                          prioritizedGenreId={genreId || undefined}
                          seasonCount={
                            item._type === "tv"
                              ? (tvSeasonCounts.get(item.id) ?? null)
                              : null
                          }
                        />
                      ))}
                    </Box>
                  )}

                  {totalPages > 1 && (
                    <SearchPagination
                      q={q ?? ""}
                      page={pageNum}
                      totalPages={totalPages}
                      includeMovies={includeMovies}
                      includeTV={includeTV}
                      year={year}
                      genreId={genreId}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Stack>
      </Container>
    </>
  );
}
