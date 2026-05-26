"use client";

import { useState } from "react";
import { Box, Rating, Typography } from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface UserRatingStarsProps {
  max?: number;
}

export default function UserRatingStars({ max = 5 }: UserRatingStarsProps) {
  const [value, setValue] = useState<number | null>(null);

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
          onChange={(_, nextValue) => setValue(nextValue)}
          emptyIcon={<StarBorderIcon fontSize="inherit" />}
          sx={{
            color: "primary.main",
            "& .MuiRating-iconEmpty": {
              color: "rgba(255,255,255,0.35)",
            },
          }}
        />
        {value ? (
          <Typography variant="body2" color="text.secondary">
            {value}/{max}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
