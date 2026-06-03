"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

import { API_BASE } from "@/lib/api";

const REFRESH_INTERVAL_MS = 45 * 60 * 1000;

export default function SessionTokenMonitor() {
  const { data: session, status, update } = useSession();
  const hasValidatedRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) {
      hasValidatedRef.current = false;
      return;
    }

    if (session.error === "RefreshAccessTokenError") {
      void signOut({ callbackUrl: "/" });
      return;
    }

    if (hasValidatedRef.current) {
      return;
    }

    hasValidatedRef.current = true;
    const accessToken = session.accessToken;

    let cancelled = false;

    async function validateAccessToken() {
      try {
        const response = await fetch(`${API_BASE}/v1/ratings/me?page=1`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          await signOut({ callbackUrl: "/" });
        }
      } catch (error) {
        console.error("Failed to validate session token", error);
      }
    }

    void validateAccessToken();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, session?.error, status]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;

    async function refreshSession() {
      if (cancelled || document.visibilityState !== "visible") {
        return;
      }

      const updatedSession = await update();

      if (cancelled) {
        return;
      }

      if (updatedSession?.error === "RefreshAccessTokenError") {
        await signOut({ callbackUrl: "/" });
      }
    }

    const intervalId = window.setInterval(() => {
      void refreshSession();
    }, REFRESH_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, update]);

  return null;
}
