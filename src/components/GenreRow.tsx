import { Box, Typography, Card, CardActionArea, CardMedia, CardContent, Chip } from '@mui/material';
import Link from 'next/link';
import type { MovieSummary, TVSummary } from '@/types/media';
import HorizontalScroller from '@/components/HorizontalScroller';

type MediaItem = (MovieSummary | TVSummary) & { _type: 'movie' | 'tv' };

const TMDB_GENRE_NAMES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Science Fiction', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
};

interface Props {
  genre: string;
  items: MediaItem[];
}

export default function GenreRow({ genre, items }: Props) {
  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ mb: 1.5, color: 'primary.main' }}
      >
        {genre}
      </Typography>

      <HorizontalScroller>
        {items.map((item) => {
          const year =
            item._type === 'movie'
              ? (item as MovieSummary).releaseYear?.toString() ?? null
              : ((item as TVSummary).firstAirDate?.slice(0, 4) ?? null);

          return (
            <Card
              key={`${item._type}-${item.id}`}
              sx={{ minWidth: 140, maxWidth: 140, flexShrink: 0 }}
            >
              <CardActionArea
                component={Link}
                href={`/media/${item._type}/${item.id}`}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={item.posterUrl ?? '/poster-placeholder.png'}
                    alt={item.title}
                    sx={{ aspectRatio: '2/3', objectFit: 'cover' }}
                  />
                  <Chip
                    label={item._type === 'movie' ? 'Movie' : 'TV'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      fontWeight: 'bold',
                      fontSize: '0.6rem',
                      height: 18,
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    display="block"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </Typography>
                  {year && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {year}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </HorizontalScroller>
    </Box>
  );
}

export function groupByGenre(
  movies: MovieSummary[],
  tvShows: TVSummary[],
): Map<string, MediaItem[]> {
  const map = new Map<string, MediaItem[]>();
  const seen = new Map<string, Set<string>>();

  function add(item: MediaItem, genreName: string) {
    if (!genreName?.trim()) return;
    if (!map.has(genreName)) {
      map.set(genreName, []);
      seen.set(genreName, new Set());
    }
    const key = `${item._type}-${item.id}`;
    if (!seen.get(genreName)!.has(key)) {
      seen.get(genreName)!.add(key);
      map.get(genreName)!.push(item);
    }
  }

  function resolveName(g: { id: number; name?: string }) {
    return g.name?.trim() || TMDB_GENRE_NAMES[g.id] || '';
  }

  const tagged: MediaItem[] = [];
  const len = Math.max(movies.length, tvShows.length);
  for (let i = 0; i < len; i++) {
    if (i < movies.length) tagged.push({ ...movies[i], _type: 'movie' });
    if (i < tvShows.length) tagged.push({ ...tvShows[i], _type: 'tv' });
  }

  for (const item of tagged) {
    for (const g of item.genres ?? []) add(item, resolveName(g));
  }

  return map;
}
