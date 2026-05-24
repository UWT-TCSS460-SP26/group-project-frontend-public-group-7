import {
  Box,
  Container,
  Stack,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";

import HomeSignInButton from "@/components/HomeSignInButton";
import SignOutButton from "@/components/SignOutButton";
import MediaCarousel from "@/components/CarouselTemplate";
import { getPopularMovies, getPopularTVShows } from "@/lib/fetchAPI";
import { auth } from "@/lib/auth";
import { APP_CONFIG } from "@/config";
import { MovieCard, TVShowCard } from "@/types/backendObjects";

/**
 * Public landing page.
 */
export default async function HomePage() {
  const session = await auth();

  let movies: MovieCard[] = [];
  let tvShows: TVShowCard[] = [];
  try {
    const movieRes = await getPopularMovies(1);
    movies = movieRes.results;
    const tvRes = await getPopularTVShows(1);
    tvShows = tvRes.results;
  } catch (e) {
    console.error("Failed to fetch media for home page:", e);
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        sx={{ bgcolor: "#000", borderBottom: "1px solid #333" }}
        elevation={0}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <MovieIcon sx={{ color: "primary.main", fontSize: 32 }} />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                  display: { xs: "none", sm: "block" },
                }}
              >
                IMDBv0
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              {session?.user && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: "medium",
                    display: { xs: "none", md: "block" },
                  }}
                >
                  Welcome, {session.user.name || session.user.email}
                </Typography>
              )}

              {session ? (
                <SignOutButton />
              ) : (
                <HomeSignInButton callbackUrl={APP_CONFIG.routes.home} />
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              mb: 2,
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            Popular Movies
          </Typography>
          <MediaCarousel items={movies} mediaType="movie" />
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              mb: 2,
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            Popular TV Shows
          </Typography>
          <MediaCarousel items={tvShows} mediaType="tv" />
        </Box>
      </Container>
    </Box>
  );
}
