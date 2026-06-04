"use client";

import { Button } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { usePathname, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMediaRouteLoading } from "@/components/MediaRouteLoadingProvider";

export default function SignInButton() {
  const { showLoadingOverlay } = useMediaRouteLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  return (
    <Button
      color="inherit"
      startIcon={<LoginIcon />}
      onClick={() => {
        showLoadingOverlay();
        void signIn("tcss460", { callbackUrl });
      }}
    >
      Sign in
    </Button>
  );
}
