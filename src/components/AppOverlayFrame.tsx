"use client";

import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface AppOverlayFrameProps {
  children: ReactNode;
  home: ReactNode;
}

export default function AppOverlayFrame({
  children,
  home,
}: AppOverlayFrameProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Box
        aria-hidden={!isHome}
        sx={{
          position: "fixed",
          inset: 0,
          overflowY: "auto",
          pointerEvents: isHome ? "auto" : "none",
          filter: isHome ? "none" : "saturate(0.82) brightness(0.72)",
          transform: isHome ? "none" : "scale(0.992)",
          transition: "filter 180ms ease, transform 180ms ease",
        }}
      >
        {home}
      </Box>

      {!isHome && (
        <Box
          component="main"
          data-route-scroll-container
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 20,
            overflowY: "auto",
            bgcolor: "rgba(18, 18, 18, 0.94)",
            boxShadow: "0 0 48px rgba(0,0,0,0.48)",
            backdropFilter: "blur(8px)",
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}
