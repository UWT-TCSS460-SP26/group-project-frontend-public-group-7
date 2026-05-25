import { Card, CardActionArea, CardContent, CardMedia, Chip, Box, Typography } from '@mui/material';
import Link from 'next/link';
import type { MovieSummary, TVSummary } from '@/types/media';

type Props =
  | { type: 'movie'; item: MovieSummary }
  | { type: 'tv'; item: TVSummary };

export default function MediaCard({ type, item }: Props) {
  const year =
    type === 'movie'
      ? (item as MovieSummary).releaseYear?.toString() ?? null
      : ((item as TVSummary).firstAirDate?.slice(0, 4) ?? null);

  const href = `/media/${type}/${item.id}`;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea
        component={Link}
        href={href}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            image={item.posterUrl ?? '/poster-placeholder.png'}
            alt={item.title}
            sx={{ aspectRatio: '2/3', objectFit: 'cover' }}
          />
          <Chip
            label={type === 'movie' ? 'Movie' : 'TV'}
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
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            gutterBottom
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {item.title}
          </Typography>
          {year && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
            >
              {year}
            </Typography>
          )}
          <Box sx={{ mb: 1 }}>
            {item.genres?.slice(0, 2).map((g) => (
              <Chip
                key={g.id}
                label={g.name}
                size="small"
                sx={{ mr: 0.5, mb: 0.5, fontSize: '0.65rem' }}
              />
            ))}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {item.overview}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}