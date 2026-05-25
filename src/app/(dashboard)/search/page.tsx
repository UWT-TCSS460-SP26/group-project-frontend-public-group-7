import { Box, Container, Divider, Stack, Typography } from '@mui/material';

import { searchMovies, searchTV, popularMoviesMultiPage, popularTVMultiPage } from '@/lib/media-api';
import SearchForm from '@/components/SearchForm';
import MediaCard from '@/components/MediaCard';
import SearchPagination from '@/components/SearchPagination';
import GenreRow, { groupByGenre } from '@/components/GenreRow';
import { ApiError } from '@/lib/api';
import type { MovieSummary, TVSummary } from '@/types/media';

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, page = '1' } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  // ── Search results (when query present) ──────────────────────────────────
  type CombinedResult = (MovieSummary & { _type: 'movie' }) | (TVSummary & { _type: 'tv' });
  let results: CombinedResult[] = [];
  let totalPages = 0;
  let totalResults = 0;
  let searchError: string | null = null;

  if (q) {
    try {
      const [moviesData, tvData] = await Promise.allSettled([
        searchMovies(q, pageNum),
        searchTV(q, pageNum),
      ]);

      const movies =
        moviesData.status === 'fulfilled'
          ? moviesData.value.results.map((m) => ({ ...m, _type: 'movie' as const }))
          : [];
      const tv =
        tvData.status === 'fulfilled'
          ? tvData.value.results.map((t) => ({ ...t, _type: 'tv' as const }))
          : [];

      const len = Math.max(movies.length, tv.length);
      for (let i = 0; i < len; i++) {
        if (i < movies.length) results.push(movies[i]);
        if (i < tv.length) results.push(tv[i]);
      }
      totalResults =
        (moviesData.status === 'fulfilled' ? moviesData.value.totalResults : 0) +
        (tvData.status === 'fulfilled' ? tvData.value.totalResults : 0);
      totalPages = Math.max(
        moviesData.status === 'fulfilled' ? moviesData.value.totalPages : 0,
        tvData.status === 'fulfilled' ? tvData.value.totalPages : 0,
      );

      if (moviesData.status === 'rejected' && tvData.status === 'rejected') {
        searchError = 'Search failed. Try again.';
      }
    } catch (e) {
      searchError =
        e instanceof ApiError ? `API error ${e.status}: ${e.statusText}` : 'Search failed. Try again.';
    }
  }

  // ── Browse rows (when no query) ──────────────────────────────────────────
  let genreRows: [string, ReturnType<typeof groupByGenre> extends Map<string, infer V> ? V : never][] = [];

  if (!q) {
    try {
      const [movies, tv] = await Promise.all([popularMoviesMultiPage(4), popularTVMultiPage(4)]);
      const grouped = groupByGenre(movies, tv);
      genreRows = [...grouped.entries()]
        .filter(([, items]) => items.length >= 3)
        .sort((a, b) => b[1].length - a[1].length);
    } catch {
      // page still renders without genre rows
    }
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4 }}
    >
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
          <SearchForm initialQ={q} />
        </Box>

        <Divider />

        {/* ── Search results ── */}
        {q && (
          <>
            {searchError ? (
              <Typography color="error">{searchError}</Typography>
            ) : (
              <>
                <Typography color="text.secondary">
                  {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''} for &ldquo;
                  {q}&rdquo;
                </Typography>

                {results.length === 0 ? (
                  <Typography>No results found.</Typography>
                ) : (
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                        md: 'repeat(4, 1fr)',
                        lg: 'repeat(5, 1fr)',
                        xl: 'repeat(6, 1fr)',
                      },
                    }}
                  >
                    {results.map((item) => (
                      <MediaCard
                        key={`${item._type}-${item.id}`}
                        type={item._type}
                        item={item as unknown as MovieSummary & TVSummary}
                      />
                    ))}
                  </Box>
                )}

                {totalPages > 1 && (
                  <SearchPagination
                    q={q}
                    type="combined"
                    page={pageNum}
                    totalPages={totalPages}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* ── Browse by genre (default state) ── */}
        {!q && (
          <Stack spacing={4}>
            {genreRows.length === 0 ? (
              <Typography color="text.secondary">
                Enter a title above to search, or browse will appear here once the API loads.
              </Typography>
            ) : (
              genreRows.map(([genre, items]) => (
                <GenreRow
                  key={genre}
                  genre={genre}
                  items={items}
                />
              ))
            )}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
