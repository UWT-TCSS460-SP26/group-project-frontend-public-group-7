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
import MediaCarousel from "@/components/CarouselTemplate";
import SearchForm from "@/components/SearchForm";
import GenreRow from "@/components/GenreRow";
import UserAccountMenu from "@/components/UserAccountMenu";
import { getPopularMovies, getPopularTVShows } from "@/lib/fetchAPI";
import { groupByGenre, type GenreMediaItem } from "@/lib/group-media-by-genre";
import { popularMoviesMultiPage, popularTVMultiPage } from "@/lib/media-api";
import { getMovieRecommendationsFromRatings } from "@/lib/recommendations";
import { auth } from "@/lib/auth";
import { APP_CONFIG } from "@/config";
import { MovieCard, TVShowCard } from "@/types/backendObjects";
import { getAllMyRatings } from "@/lib/user-content-api";

/**
 * Public landing page.
 */
export default async function HomePage() {
  const session = await auth();
  const user = session?.user;

  let movies: MovieCard[] = [];
  let tvShows: TVShowCard[] = [];
  let genreRows: [string, GenreMediaItem[]][] = [];
  let recommendedMovies: Awaited<
    ReturnType<typeof getMovieRecommendationsFromRatings>
  > = [];
  let totalRatingsCount = 0;
  let browseError = false;
  try {
    const [movieRes, tvRes, browseMovies, browseTV] = await Promise.all([
      getPopularMovies(1),
      getPopularTVShows(1),
      popularMoviesMultiPage(8),
      popularTVMultiPage(8),
    ]);
    movies = movieRes.results;
    tvShows = tvRes.results;
    const grouped = groupByGenre(browseMovies, browseTV);
    genreRows = [...grouped.entries()]
      .filter(([, items]) => items.length >= 3)
      .sort((a, b) => b[1].length - a[1].length);
  } catch (e) {
    console.error("Failed to fetch media for home page:", e);
    browseError = true;
  }

  if (session?.accessToken) {
    try {
      const ratings = await getAllMyRatings(session.accessToken);
      totalRatingsCount = ratings.length;
      if (totalRatingsCount >= 10) {
        recommendedMovies = await getMovieRecommendationsFromRatings(ratings);
      }
    } catch (error) {
      console.error("Failed to build home page recommendations:", error);
    }
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <AppBar
        position="static"
        sx={{ bgcolor: "#000", borderBottom: "1px solid #333" }}
        elevation={0}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
              <MovieIcon sx={{ color: "primary.main", fontSize: 42, mt: 0.2 }} />
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  ml: -6.6,
                  mt: 0.1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 42,
                    pl: 6.6,
                  }}
                >
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      color: "primary.main",
                      fontWeight: "bold",
                      letterSpacing: 0.5,
                      lineHeight: 1,
                    }}
                  >
                    7MDB
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.15,
                    mt: 0.2,
                  }}
                >
                  Rate and review movies and TV shows.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "100%", md: 560 },
                maxWidth: { xs: "100%", md: 1120 },
                order: { xs: 3, md: 2 },
              }}
            >
              <SearchForm destination={APP_CONFIG.routes.search} compact />
            </Box>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ order: { xs: 2, md: 3 } }}
            >
              {user && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: "medium",
                    display: { xs: "none", md: "block" },
                  }}
                >
                  Welcome
                </Typography>
              )}

              {user ? (
                <UserAccountMenu
                  label={user.name || user.email || "Signed in"}
                />
              ) : (
                <HomeSignInButton callbackUrl={APP_CONFIG.routes.home} />
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth={false} sx={{ py: 5, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: { xs: 7, md: 9 } }}>
          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              mb: 2,
              textAlign: "left",
              fontWeight: "bold",
              fontSize: { xs: "2.1rem", md: "3rem" },
            }}
          >
            Popular Movies
          </Typography>
          <MediaCarousel
            items={movies}
            mediaType="movie"
            infinite={movies.length >= 10}
          />
        </Box>

        <Box sx={{ mb: { xs: 7, md: 9 } }}>
          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              mb: 2,
              textAlign: "left",
              fontWeight: "bold",
              fontSize: { xs: "2.1rem", md: "3rem" },
            }}
          >
            Popular TV Shows
          </Typography>
          <MediaCarousel
            items={tvShows}
            mediaType="tv"
            infinite={tvShows.length >= 10}
          />
        </Box>

        {user && (
          <Box sx={{ mb: { xs: 7, md: 9 } }}>
            <Typography
              variant="h4"
              sx={{
                color: "primary.main",
                mb: 1,
                textAlign: "left",
                fontWeight: "bold",
                fontSize: { xs: "2.1rem", md: "3rem" },
              }}
            >
              Recommended for You
            </Typography>

            {recommendedMovies.length > 0 ? (
              <GenreRow
                genre="Because you rated similar titles highly"
                items={recommendedMovies}
                headingSx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              />
            ) : totalRatingsCount < 10 ? (
              <Typography color="text.secondary">
                {totalRatingsCount > 0
                  ? `You have rated ${totalRatingsCount} title${totalRatingsCount === 1 ? "" : "s"}. Rate at least ${10 - totalRatingsCount} more title${10 - totalRatingsCount === 1 ? "" : "s"} to unlock personalized recommendations.`
                  : "Rate at least 10 titles to get personalized movie and TV show recommendations."}
              </Typography>
            ) : (
              <Typography color="text.secondary">
                We couldn&apos;t build recommendations yet from your current
                ratings. Try rating a few more titles to strengthen the list.
              </Typography>
            )}
          </Box>
        )}

        <Stack spacing={{ xs: 4, md: 5 }}>
          <Box sx={{ mb: "-30px" }}>
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              sx={{ color: "primary.main", fontSize: { xs: "2.1rem", md: "3rem" } }}
            >
              Explore
            </Typography>
          </Box>

          {genreRows.length === 0 ? (
            <Typography color="text.secondary">
              {browseError
                ? "Popular titles could not be loaded right now."
                : "Popular titles will appear here once the API loads."}
            </Typography>
          ) : (
            genreRows.map(([genre, items]) => (
              <GenreRow key={genre} genre={genre} items={items} />
            ))
          )}
        </Stack>
      </Container>
    </Box>
  );
}
