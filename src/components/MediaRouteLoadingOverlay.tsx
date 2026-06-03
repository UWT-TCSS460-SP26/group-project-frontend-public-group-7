"use client";

import { Box } from "@mui/material";

interface MediaRouteLoadingOverlayProps {
  message?: string;
}

export default function MediaRouteLoadingOverlay({
  message = "Loading",
}: MediaRouteLoadingOverlayProps) {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "transparent",
        pointerEvents: "auto",
      }}
    >
      <Box
        role="status"
        aria-label={message}
        aria-live="polite"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 112,
          height: 92,
          borderRadius: 2,
          border: "1px solid rgba(255,255,255,0.16)",
          bgcolor: "#0a0a0a",
          boxShadow: "0 16px 44px rgba(0,0,0,0.45)",
          color: "common.white",
          "@keyframes loadingReelSpin": {
            to: { transform: "rotate(360deg)" },
          },
          "@keyframes loadingFilmSlide": {
            to: { transform: "translateX(-16px)" },
          },
          "@keyframes loadingBulbPulse": {
            "0%, 100%": { opacity: 0.42 },
            "50%": { opacity: 1 },
          },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "relative",
            width: 72,
            height: 44,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 2,
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: "3px solid",
              borderColor: "primary.main",
              background:
                "radial-gradient(circle at center, #0a0a0a 0 18%, transparent 19%), radial-gradient(circle at 50% 13%, #f5c518 0 8%, transparent 9%), radial-gradient(circle at 87% 50%, #f5c518 0 8%, transparent 9%), radial-gradient(circle at 50% 87%, #f5c518 0 8%, transparent 9%), radial-gradient(circle at 13% 50%, #f5c518 0 8%, transparent 9%)",
              boxShadow: "0 0 18px rgba(245,197,24,0.28)",
              animation: "loadingReelSpin 1.1s linear infinite",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: 14,
              width: 50,
              height: 20,
              overflow: "hidden",
              borderTop: "2px solid rgba(255,255,255,0.86)",
              borderBottom: "2px solid rgba(255,255,255,0.86)",
              borderRadius: 0.5,
              bgcolor: "rgba(255,255,255,0.08)",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                width: 82,
                background:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.72) 0 4px, transparent 4px 8px), linear-gradient(180deg, transparent 0 6px, rgba(245,197,24,0.86) 6px 14px, transparent 14px 20px)",
                animation: "loadingFilmSlide 0.75s linear infinite",
              },
            }}
          />
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                position: "absolute",
                bottom: 0,
                left: 44 + index * 9,
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: "primary.main",
                animation: "loadingBulbPulse 900ms ease-in-out infinite",
                animationDelay: `${index * 120}ms`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
