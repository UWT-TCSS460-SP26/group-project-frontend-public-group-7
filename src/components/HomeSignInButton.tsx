"use client";

import { Button } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { signIn } from "next-auth/react";

interface HomeSignInButtonProps {
  callbackUrl: string;
}

/**
 * Big primary Sign-In button used on the splash. `SignInButton` is the small
 * AppBar variant; this one is `contained` + `large` + `fullWidth` so it reads
 * as the primary CTA on a centered hero layout.
 */
export default function HomeSignInButton({
  callbackUrl,
}: HomeSignInButtonProps) {
  return (
    <Button
      variant="contained"
      size="large"
      fullWidth
      startIcon={<LoginIcon />}
      onClick={() => signIn("tcss460", { callbackUrl })}
    >
      Sign in
    </Button>
  );
}
