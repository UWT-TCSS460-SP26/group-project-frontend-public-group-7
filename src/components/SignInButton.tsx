"use client";

import { Button } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { signIn } from "next-auth/react";
import { useMediaRouteLoading } from "@/components/MediaRouteLoadingProvider";

export default function SignInButton() {
  const { showLoadingOverlay } = useMediaRouteLoading();

  return (
    <Button
      color="inherit"
      startIcon={<LoginIcon />}
      onClick={() => {
        showLoadingOverlay();
        void signIn("tcss460", { callbackUrl: "/search" });
      }}
    >
      Sign in
    </Button>
  );
}
