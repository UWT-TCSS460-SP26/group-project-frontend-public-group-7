"use client";

import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Modal, Backdrop, Fade, IconButton, Stack, Chip, Divider,} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MovieCard, MovieDetail, TVShowCard, TVShowDetail, } from "@/types/backendObjects";
import { getMovieById, getTVShowById } from "@/lib/fetchAPI";

interface MediaCarouselProps {
  items: (MovieCard | TVShowCard)[];
  mediaType: "movie" | "tv";
}

export default function MediaCarousel({
  items,
  mediaType,
}: MediaCarouselProps) {
  const [offset, setOffset] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MovieDetail | TVShowDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, width: 0 });
  const requestRef = useRef<number>(null);

  const itemCount = items.length;
  const cardWidth = 180;
  const spacing = 220;
  const totalWidth = itemCount * spacing;

  useEffect(() => {
    const animate = () => {
      const centerX = mousePos.current.width / 2;
      const mouseOffset = mousePos.current.x - centerX;
      const threshold = mousePos.current.width * 0.1;

      if (Math.abs(mouseOffset) > threshold) {
        const speed = (mouseOffset / centerX) * 15;
        setOffset((prev) => (prev - speed) % totalWidth);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [totalWidth]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (carouselRef.current) {
      const rect = carouselRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        width: rect.width,
      };
    }
  };

  const handleMouseLeave = () => {
    if (carouselRef.current) {
      // Reset x to center to stop rotation
      mousePos.current = {
        ...mousePos.current,
        x: mousePos.current.width / 2,
      };
    }
  };

  const handleItemClick = async (id: number) => {
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const result =
        mediaType === "movie"
          ? await getMovieById(id)
          : await getTVShowById(id);
      setDetail(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleClose = () => {
    setSelectedId(null);
    setDetail(null);
  };

  return (
    <Box
      ref={carouselRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: "100%",
        height: "420px", // Reduced height
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        cursor: "crosshair",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "280px", // Adjusted height
          position: "relative",
        }}
      >
        {items.map((item, index) => {
          // Calculate horizontal position with wrapping
          let x = (index * spacing + offset) % totalWidth;

          // Center the wrapping window around 0
          if (x > totalWidth / 2) x -= totalWidth;
          if (x < -totalWidth / 2) x += totalWidth;

          // Subtle scale effect for cards near the center
          const distanceFromCenter = Math.abs(x);
          const scale = Math.max(0.8, 1.1 - distanceFromCenter / 1000);

          return (
            <Box
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              sx={{
                position: "absolute",
                width: `${cardWidth}px`,
                height: "280px", // Adjusted height
                left: "50%",
                top: "50%",
                marginLeft: `-${cardWidth / 2}px`,
                marginTop: "-140px", // Adjusted offset
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                cursor: "pointer",
                transform: `translateX(${x}px) scale(${scale})`,
                zIndex: Math.round(100 - distanceFromCenter / 10),
                transition: "box-shadow 0.3s, transform 0.1s linear",
                "&:hover": {
                  boxShadow: "0 0 20px #F5C518", // Yellow glow on hover
                  zIndex: 1000,
                  "& .media-info": {
                    bgcolor: "rgba(0,0,0,0.85)",
                  },
                },
              }}
            >
              <img
                src={
                  item.posterUrl ||
                  "https://via.placeholder.com/200x300?text=No+Poster"
                }
                alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Box
                className="media-info"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.6)",
                  color: "#F5C518", // Yellow text
                  p: 2,
                  textAlign: "center",
                  transition: "background-color 0.3s",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  {item.title}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Media Details Modal */}
      <Modal
        open={selectedId !== null}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={selectedId !== null}>
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
            {loadingDetail ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography>Loading details...</Typography>
              </Box>
            ) : (
              detail && (
                <Box>
                  <Box sx={{ position: "relative", height: "300px" }}>
                    <IconButton
                      onClick={handleClose}
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
                      src={detail.backdropUrl || detail.posterUrl || ""}
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
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.9))",
                        color: "white",
                      }}
                    >
                      <Typography variant="h4" component="h2">
                        {detail.title}
                      </Typography>
                      <Typography variant="subtitle1">
                        {mediaType === "movie"
                          ? (detail as MovieDetail).releaseYear
                          : new Date(
                              (detail as TVShowDetail).firstAirDate,
                            ).getFullYear()}
                        {mediaType === "movie" &&
                          ` • ${(detail as MovieDetail).runtimeMinutes} min`}
                        {mediaType === "tv" &&
                          ` • ${(detail as TVShowDetail).totalSeasons} Seasons`}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      {detail.genres.map((g) => (
                        <Chip key={g.id} label={g.name} size="small" />
                      ))}
                      <Chip
                        label={`Rating: ${detail.rating}/10`}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    <Typography variant="h6" gutterBottom>
                      Overview
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                    >
                      {detail.overview}
                    </Typography>

                    {mediaType === "movie" &&
                      (detail as MovieDetail).tagline && (
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
                          sx={{ minWidth: "100px", textAlign: "center" }}
                        >
                          <Box
                            component="img"
                            src={
                              member.profileUrl ||
                              "https://via.placeholder.com/100x150?text=No+Photo"
                            }
                            sx={{
                              width: "80px",
                              height: "120px",
                              objectFit: "cover",
                              borderRadius: 1,
                              mb: 1,
                            }}
                          />
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{ fontWeight: "bold" }}
                          >
                            {member.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {member.character}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Box>
              )
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
