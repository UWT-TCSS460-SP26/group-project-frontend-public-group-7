"use client";

import { Link as MuiLink } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { signIn } from "next-auth/react";
import { useMediaRouteLoading } from "@/components/MediaRouteLoadingProvider";

interface HomeSignInButtonProps {
  callbackUrl: string;
}

/**
 * AppBar sign-in link for the public home page.
 */
export default function HomeSignInButton({
  callbackUrl,
}: HomeSignInButtonProps) {
  const { showLoadingOverlay } = useMediaRouteLoading();

  return (
    <MuiLink
      href="#"
      underline="hover"
      color="primary.main"
      onClick={(event) => {
        event.preventDefault();
        showLoadingOverlay();
        void signIn("tcss460", { callbackUrl });
      }}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        fontWeight: 700,
        textDecorationColor: "transparent",
        transition: "text-decoration-color 0.2s ease",
        "&:hover": {
          textDecorationColor: "currentColor",
        },
      }}
    >
      <LoginIcon fontSize="small" />
      Sign in
    </MuiLink>
  );
}
