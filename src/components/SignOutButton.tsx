"use client";

import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "next-auth/react";
import { useMediaRouteLoading } from "@/components/MediaRouteLoadingProvider";

/**
 * Clears the NextAuth session cookie and redirects home.
 */
export default function SignOutButton() {
  const { showLoadingOverlay } = useMediaRouteLoading();

  return (
    <Button
      color="inherit"
      startIcon={<LogoutIcon />}
      onClick={() => {
        showLoadingOverlay();
        void signOut({ callbackUrl: "/" });
      }}
    >
      Sign out
    </Button>
  );
}
