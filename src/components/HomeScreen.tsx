import {
  AppBar,
  Box,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MovieIcon from "@mui/icons-material/Movie";

import HomeSignInButton from "@/components/HomeSignInButton";
import MediaCarousel from "@/components/CarouselTemplate";
import SearchForm from "@/components/SearchForm";
import GenreRow from "@/components/GenreRow";
import UserAccountMenu from "@/components/UserAccountMenu";
import { type GenreMediaItem } from "@/lib/group-media-by-genre";
import { getCachedHomePageMedia } from "@/lib/home-page-data";
import { getMovieRecommendationsFromRatings } from "@/lib/recommendations";
import { auth } from "@/lib/auth";
import { APP_CONFIG } from "@/config";
import { MovieCard, TVShowCard } from "@/types/backendObjects";
import { getAllMyRatings, UserContentApiError } from "@/lib/user-content-api";
import { getCurrentUserDisplayName } from "@/lib/user-profile";

export default async function HomeScreen() {
  const session = await auth();
  const user = session?.user;

  let movies: MovieCard[] = [];
  let tvShows: TVShowCard[] = [];
  let genreRows: [string, GenreMediaItem[]][] = [];
  let recommendedMovies: Awaited<
    ReturnType<typeof getMovieRecommendationsFromRatings>
  > = [];
  let totalRatingsCount = 0;
  let userMenuLabel = user?.name || user?.email || "Signed in";
  let browseError = false;
  try {
    const homeMedia = await getCachedHomePageMedia();
    movies = homeMedia.movies;
    tvShows = homeMedia.tvShows;
    genreRows = homeMedia.genreRows;
  } catch (e) {
    console.error("Failed to fetch media for home page:", e);
    browseError = true;
  }

  if (session?.accessToken) {
    const [displayNameResult, ratingsResult] = await Promise.allSettled([
      getCurrentUserDisplayName(session.accessToken),
      getAllMyRatings(session.accessToken),
    ]);

    if (displayNameResult.status === "fulfilled" && displayNameResult.value) {
      userMenuLabel = displayNameResult.value;
    }

    if (ratingsResult.status === "fulfilled") {
      const ratings = ratingsResult.value;
      totalRatingsCount = ratings.length;
      if (totalRatingsCount >= 10) {
        recommendedMovies = await getMovieRecommendationsFromRatings(ratings);
      }
    } else {
      const error = ratingsResult.reason;
      if (error instanceof UserContentApiError && error.status === 401) {
        totalRatingsCount = 0;
        recommendedMovies = [];
      } else {
        console.error("Failed to build home page recommendations:", error);
      }
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
            sx={{
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
              alignItems: { xs: "stretch", md: "flex-start" },
              py: { xs: 1, md: 1.25 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                pt: { xs: 0, md: 0.35 },
              }}
            >
              <MovieIcon
                sx={{ color: "primary.main", fontSize: 32, mt: 0.1 }}
              />
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  ml: -5.2,
                  mt: 0.1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 32,
                    pl: 5.2,
                  }}
                >
                  <Typography
                    variant="h6"
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
                minWidth: { xs: "100%", md: 0 },
                maxWidth: { xs: "100%", md: "none" },
                order: { xs: 3, md: 2 },
              }}
            >
              <SearchForm destination={APP_CONFIG.routes.search} compact />
            </Box>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                order: { xs: 2, md: 3 },
                alignSelf: { xs: "flex-end", md: "flex-start" },
                minHeight: 40,
              }}
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
                <UserAccountMenu label={userMenuLabel} />
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
              sx={{
                color: "primary.main",
                fontSize: { xs: "2.1rem", md: "3rem" },
              }}
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
