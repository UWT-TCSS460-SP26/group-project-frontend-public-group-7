"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Box, CircularProgress, Rating, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

import { API_BASE } from "@/lib/api";
import type { MediaType } from "@/types/media";

interface UserRatingStarsProps {
  tmdbId: number;
  mediaType: MediaType;
  max?: number;
}

export default function UserRatingStars({
  tmdbId,
  mediaType,
  max = 5,
}: UserRatingStarsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [value, setValue] = useState<number | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadExistingRating() {
      if (!session?.accessToken) {
        setLoadingExisting(false);
        return;
      }

      try {
        let page = 1;
        let totalPages = 1;
        let existingRating: { score: number } | undefined;

        while (page <= totalPages && !existingRating) {
          const params = new URLSearchParams({
            page: String(page),
            pageSize: "50",
            mediaType,
          });
          const response = await fetch(
            `${API_BASE}/v1/users/me/ratings?${params}`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
              cache: "no-store",
            },
          );

          if (!response.ok) {
            throw new Error(`Failed to load your rating: ${response.status}`);
          }

          const telemetry = (await response.json()) as {
            totalPages: number;
            results: Array<{
              tmdbId: number;
              mediaType: MediaType;
              score: number;
            }>;
          };

          totalPages = telemetry.totalPages;
          existingRating = telemetry.results.find(
            (rating) =>
              rating.tmdbId === tmdbId && rating.mediaType === mediaType,
          );
          page += 1;
        }

        if (!cancelled) {
          setValue(
            typeof existingRating?.score === "number"
              ? existingRating.score / 2
              : null,
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Couldn't load your rating.");
        }
      } finally {
        if (!cancelled) {
          setLoadingExisting(false);
        }
      }
    }

    void loadExistingRating();

    return () => {
      cancelled = true;
    };
  }, [mediaType, session?.accessToken, tmdbId]);

  async function handleChange(nextValue: number | null) {
    if (!session?.accessToken || nextValue == null) {
      return;
    }

    const apiScore = Math.round(nextValue * 2);
    setValue(nextValue);
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/v1/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          tmdbId,
          mediaType,
          score: apiScore,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save rating: ${response.status}`);
      }

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Couldn't save your rating.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        mt: 1.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        Rate this title
      </Typography>
      {loadingExisting ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Loading your rating...
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 1,
            width: "100%",
          }}
        >
          <Rating
            value={value}
            max={max}
            precision={0.5}
            onChange={(_, nextValue) => void handleChange(nextValue)}
            icon={<StarIcon fontSize="inherit" />}
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
            disabled={submitting}
            sx={{
              "& .MuiRating-iconFilled": {
                color: "primary.main",
              },
              "& .MuiRating-iconHover": {
                color: "primary.main",
              },
              "& .MuiRating-iconFocus": {
                color: "primary.main",
              },
              "& .MuiRating-iconEmpty": {
                color: "rgba(255, 193, 7, 0.45)",
              },
            }}
          />
          {value ? (
            <Typography variant="body2" color="text.secondary">
              {value.toFixed(1).replace(".0", "")}/{max}
            </Typography>
          ) : null}
        </Box>
      )}
      {error ? (
        <Typography variant="caption" color="error" sx={{ mt: 0.75 }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}
