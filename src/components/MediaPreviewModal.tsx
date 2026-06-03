"use client";

import { startTransition, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Backdrop,
  Box,
  Button,
  Chip,
  Divider,
  Fade,
  IconButton,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

import { MovieDetail, TVShowDetail } from "@/types/backendObjects";
import {
  formatDisplayYear,
  formatDisplayYearFromDate,
} from "@/lib/format-display-year";
import { formatRatingOutOfFive } from "@/lib/format-rating-out-of-five";
import { loadMediaPreviewData } from "@/lib/media-preview-data";
import CastFilmographyLink from "@/components/CastFilmographyLink";
import { useMediaRouteLoading } from "@/components/MediaRouteLoadingProvider";
import { safeRouterPrefetch } from "@/lib/safe-router-prefetch";

interface MediaPreviewModalProps {
  mediaId: number | null;
  mediaType: "movie" | "tv";
  onClose: () => void;
}

const TITLE_HERO_PLACEHOLDER = "/movie-theater-placeholder.svg";

export default function MediaPreviewModal({
  mediaId,
  mediaType,
  onClose,
}: MediaPreviewModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hideLoadingOverlay, showLoadingOverlay } = useMediaRouteLoading();
  const [detail, setDetail] = useState<MovieDetail | TVShowDetail | null>(null);
  const [communityRating, setCommunityRating] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingNavigation, setLoadingNavigation] = useState(false);
  const isOpen = mediaId !== null;

  useEffect(() => {
    if (pathname !== "/" && isOpen) {
      setLoadingNavigation(false);
      onClose();
    }
  }, [isOpen, onClose, pathname]);

  useEffect(() => {
    if (mediaId == null) {
      setDetail(null);
      setCommunityRating(null);
      setLoadingDetail(false);
      setLoadingNavigation(false);
      hideLoadingOverlay();
      return;
    }

    let cancelled = false;
    const resolvedMediaId = mediaId;

    async function loadDetail() {
      setLoadingDetail(true);
      showLoadingOverlay();
      try {
        const result = await loadMediaPreviewData(resolvedMediaId, mediaType);

        if (!cancelled) {
          setDetail(result.detail);
          setCommunityRating(
            result.ratings.totalRatings > 0
              ? result.ratings.averageScore
              : null,
          );
          safeRouterPrefetch(router, `/media/${mediaType}/${result.detail.id}`);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setDetail(null);
          setCommunityRating(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
          hideLoadingOverlay();
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [hideLoadingOverlay, mediaId, mediaType, router, showLoadingOverlay]);

  function handleViewFullDetails() {
    if (!detail || loadingNavigation) {
      return;
    }

    setLoadingNavigation(true);
    showLoadingOverlay();
    startTransition(() => {
      router.push(`/media/${mediaType}/${detail.id}`);
    });
  }

  return (
    <Modal
      open={isOpen}
      onClose={loadingNavigation ? undefined : onClose}
      disableScrollLock
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen && !loadingDetail && Boolean(detail)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "700px" },
            maxHeight: "90vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            outline: "none",
            overflowY: "auto",
            p: 0,
          }}
        >
          {detail && (
            <Box>
              <Box sx={{ position: "relative", height: "300px" }}>
                <IconButton
                  onClick={onClose}
                  disabled={loadingNavigation}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    zIndex: 1,
                    color: "white",
                    bgcolor: "rgba(0,0,0,0.5)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Box
                  component="img"
                  src={detail.backdropUrl || TITLE_HERO_PLACEHOLDER}
                  alt=""
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    p: 3,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
                    color: "white",
                  }}
                >
                  <Typography variant="h4" component="h2">
                    {detail.title}
                  </Typography>
                  <Typography variant="subtitle1">
                    {mediaType === "movie"
                      ? formatDisplayYear((detail as MovieDetail).releaseYear)
                      : formatDisplayYearFromDate(
                          (detail as TVShowDetail).firstAirDate,
                        )}
                    {mediaType === "movie" &&
                      ` • ${(detail as MovieDetail).runtimeMinutes ?? "?"} min`}
                    {mediaType === "tv" &&
                      ` • ${(detail as TVShowDetail).totalSeasons ?? "?"} Seasons`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 2, flexWrap: "wrap", rowGap: 1 }}
                >
                  {detail.genres.map((g) => (
                    <Chip key={g.id} label={g.name} size="small" />
                  ))}
                  <Chip
                    label={`TMDB ${detail.rating.toFixed(2)}/10`}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={
                      communityRating == null
                        ? "Members: No Ratings"
                        : `Members ${formatRatingOutOfFive(communityRating)}/5`
                    }
                    color="secondary"
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                <Typography variant="h6" gutterBottom>
                  Overview
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {detail.overview}
                </Typography>

                {mediaType === "movie" && (detail as MovieDetail).tagline && (
                  <Typography
                    variant="body2"
                    sx={{ fontStyle: "italic", mb: 2 }}
                  >
                    &ldquo;{(detail as MovieDetail).tagline}&rdquo;
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  Cast
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ overflowX: "auto", pb: 1 }}
                >
                  {detail.cast.slice(0, 5).map((member, idx) => (
                    <Box
                      key={idx}
                      component={CastFilmographyLink}
                      href={`/cast/${encodeURIComponent(member.name)}?image=${encodeURIComponent(member.profileUrl ?? "")}`}
                      sx={{
                        minWidth: "100px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textDecoration: "none",
                        color: "inherit",
                        transition: "transform 140ms ease",
                        "&:active": {
                          transform: "scale(0.94)",
                        },
                        "&:hover .cast-member-image": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 0 18px rgba(245,197,24,0.38)",
                        },
                      }}
                    >
                      {member.profileUrl ? (
                        <Box
                          className="cast-member-image"
                          component="img"
                          src={member.profileUrl}
                          sx={{
                            width: "80px",
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: 1,
                            mb: 1,
                            display: "block",
                            mx: "auto",
                            transition:
                              "transform 160ms ease, box-shadow 160ms ease",
                          }}
                        />
                      ) : (
                        <Box
                          className="cast-member-image"
                          sx={{
                            width: "80px",
                            height: "120px",
                            borderRadius: 1,
                            mb: 1,
                            mx: "auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.35)",
                            transition:
                              "transform 160ms ease, box-shadow 160ms ease",
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 36 }} />
                        </Box>
                      )}
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ fontWeight: "bold", width: "100%" }}
                      >
                        {member.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ width: "100%" }}
                      >
                        {member.character}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Button
                  disabled={loadingNavigation}
                  variant="outlined"
                  color="primary"
                  onClick={handleViewFullDetails}
                  sx={{ mt: 1 }}
                >
                  {loadingNavigation ? "Opening..." : "View Full Details"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}
