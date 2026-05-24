"use client";

import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "next-auth/react";

/**
 * Clears the NextAuth session cookie and redirects home.
 */
export default function SignOutButton() {
  return (
    <Button
      color="inherit"
      startIcon={<LogoutIcon />}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Button>
  );
}
