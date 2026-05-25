import { notFound } from 'next/navigation';
import {
  Avatar,
  Box,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';

import { enrichedMovie, enrichedTV } from '@/lib/media-api';
import { ApiError } from '@/lib/api';
import HorizontalScroller from '@/components/HorizontalScroller';
import type { CastMember, MovieDetail, TVDetail, Community, SimilarTitle } from '@/types/media';

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default async function MediaDetailPage({ params }: PageProps) {
  const { type, id } = await params;

  if (type !== 'movie' && type !== 'tv') notFound();

  let tmdb: MovieDetail | TVDetail;
  let community: Community;

  try {
    if (type === 'movie') {
      const data = await enrichedMovie(id);
      tmdb = data.tmdb;
      community = data.community;
    } else {
      const data = await enrichedTV(id);
      tmdb = data.tmdb;
      community = data.community;
    }
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const movieDetail = type === 'movie' ? (tmdb as MovieDetail) : null;
  const tvDetail = type === 'tv' ? (tmdb as TVDetail) : null;

  const year =
    movieDetail?.releaseYear?.toString() ??
    tvDetail?.firstAirDate?.slice(0, 4) ??
    null;

  const meta: string[] = [];
  if (year) meta.push(year);
  if (movieDetail?.runtimeMinutes) meta.push(`${movieDetail.runtimeMinutes} min`);
  if (tvDetail?.totalSeasons) meta.push(`${tvDetail.totalSeasons} season${tvDetail.totalSeasons !== 1 ? 's' : ''}`);
  if (tvDetail?.totalEpisodes) meta.push(`${tvDetail.totalEpisodes} episodes`);
  if (tmdb.status) meta.push(tmdb.status);

  return (
    <Box>
      {/* ── Backdrop ── */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 220, md: 420 },
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {tmdb.backdropUrl && (
          <Box
            component="img"
            src={tmdb.backdropUrl}
            alt=""
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.45,
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            }}
          />
        )}
      </Box>

      <Container maxWidth="lg" sx={{ mt: -10, position: 'relative', pb: 6 }}>
        <Stack spacing={5}>
          {/* ── Hero ── */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 4 },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-end' },
            }}
          >
            {/* Poster */}
            <Box
              component="img"
              src={tmdb.posterUrl ?? '/poster-placeholder.png'}
              alt={tmdb.title}
              sx={{
                width: { xs: 140, md: 200 },
                flexShrink: 0,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}
            />

            {/* Info */}
            <Box sx={{ pb: { sm: 1 } }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {tmdb.title}
              </Typography>

              {'tagline' in tmdb && tmdb.tagline && (
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  fontStyle="italic"
                  gutterBottom
                >
                  {tmdb.tagline}
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {meta.join(' · ')}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                {tmdb.genres.map((g) => (
                  <Chip key={g.id} label={g.name ?? g.id} size="small" />
                ))}
              </Box>

              {/* Community rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <StarIcon sx={{ color: 'primary.main' }} />
                <Typography fontWeight="bold" fontSize="1.1rem">
                  {community.averageRating != null
                    ? community.averageRating.toFixed(1)
                    : 'No ratings yet'}
                </Typography>
                {community.reviewCount > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    ({community.reviewCount} review{community.reviewCount !== 1 ? 's' : ''})
                  </Typography>
                )}
              </Box>

              {/* Sign in to rate placeholder */}
              <Box
                sx={{
                  mt: 1.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  color: 'text.disabled',
                }}
              >
                <LockIcon fontSize="small" />
                <Typography variant="body2">Sign in to rate</Typography>
              </Box>

              {/* Networks */}
              {tvDetail?.networks && tvDetail.networks.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 2, alignItems: 'center' }}>
                  {tvDetail.networks.map((n) =>
                    n.logoUrl ? (
                      <Box
                        key={n.name}
                        component="img"
                        src={n.logoUrl}
                        alt={n.name}
                        sx={{ height: 24, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.7 }}
                      />
                    ) : (
                      <Typography key={n.name} variant="caption" color="text.secondary">
                        {n.name}
                      </Typography>
                    ),
                  )}
                </Box>
              )}
            </Box>
          </Box>

          <Divider />

          {/* ── Overview ── */}
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
              Overview
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {tmdb.overview}
            </Typography>
          </Box>

          <Divider />

          {/* ── Cast ── */}
          {tmdb.cast && tmdb.cast.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
                Cast
              </Typography>
              <HorizontalScroller>
                {tmdb.cast.map((member: CastMember) => (
                  <Box
                    key={`${member.name}-${member.character}`}
                    sx={{ minWidth: 90, maxWidth: 90, textAlign: 'center', flexShrink: 0 }}
                  >
                    <Avatar
                      src={member.profileUrl ?? undefined}
                      alt={member.name}
                      sx={{ width: 72, height: 72, mx: 'auto', mb: 0.75 }}
                    />
                    <Typography variant="caption" fontWeight="bold" display="block" noWrap>
                      {member.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {member.character}
                    </Typography>
                  </Box>
                ))}
              </HorizontalScroller>
            </Box>
          )}

          {/* ── Similar titles ── */}
          {tmdb.similar && tmdb.similar.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
                  More Like This
                </Typography>
                <HorizontalScroller>
                  {tmdb.similar.map((s: SimilarTitle) => (
                    <Box
                      key={s.id}
                      component="a"
                      href={`/media/${type}/${s.id}`}
                      sx={{ minWidth: 120, maxWidth: 120, flexShrink: 0, textDecoration: 'none' }}
                    >
                      <Box
                        component="img"
                        src={s.posterUrl ?? '/poster-placeholder.png'}
                        alt={s.title}
                        sx={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 1 }}
                      />
                      <Typography variant="caption" display="block" noWrap mt={0.5}>
                        {s.title}
                      </Typography>
                      {s.releaseYear && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {s.releaseYear}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </HorizontalScroller>
              </Box>
            </>
          )}

          {/* ── Recent reviews ── */}
          {community.recentReviews.length > 0 && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
                  Recent Reviews
                </Typography>
                <Stack spacing={2}>
                  {community.recentReviews.map((r) => (
                    <Box key={r.id} sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {r.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {r.body}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
