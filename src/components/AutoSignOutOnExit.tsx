"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const EXIT_SIGN_OUT_ENDPOINT = "/api/auth/exit-signout";

export default function AutoSignOutOnExit() {
  const { status } = useSession();
  const isReloadingRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    function markReloadIntent(event: KeyboardEvent) {
      if (event.key === "F5" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r")) {
        isReloadingRef.current = true;
      }
    }

    function clearReloadIntent() {
      isReloadingRef.current = false;
    }

    function markNavigationReload(event: Event) {
      const navigationEvent = event as Event & { navigationType?: string };
      isReloadingRef.current = navigationEvent.navigationType === "reload";
    }

    function signOutOnExit() {
      if (isReloadingRef.current) {
        return;
      }

      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        navigator.sendBeacon(EXIT_SIGN_OUT_ENDPOINT);
        return;
      }

      void fetch(EXIT_SIGN_OUT_ENDPOINT, {
        method: "POST",
        keepalive: true,
      });
    }

    const navigationApi = (window as Window & {
      navigation?: EventTarget & {
        addEventListener: (type: "navigate", listener: EventListener) => void;
        removeEventListener: (type: "navigate", listener: EventListener) => void;
      };
    }).navigation as
      | (EventTarget & {
          addEventListener: (type: "navigate", listener: EventListener) => void;
          removeEventListener: (type: "navigate", listener: EventListener) => void;
        })
      | undefined;

    window.addEventListener("keydown", markReloadIntent);
    window.addEventListener("pageshow", clearReloadIntent);
    window.addEventListener("focus", clearReloadIntent);
    window.addEventListener("beforeunload", signOutOnExit);
    navigationApi?.addEventListener("navigate", markNavigationReload as EventListener);

    return () => {
      window.removeEventListener("keydown", markReloadIntent);
      window.removeEventListener("pageshow", clearReloadIntent);
      window.removeEventListener("focus", clearReloadIntent);
      window.removeEventListener("beforeunload", signOutOnExit);
      navigationApi?.removeEventListener(
        "navigate",
        markNavigationReload as EventListener,
      );
    };
  }, [status]);

  return null;
}
