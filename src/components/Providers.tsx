"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
// import AutoSignOutOnExit from "./AutoSignOutOnExit";
import AwardUnlockNotifier from "./AwardUnlockNotifier";
import { MediaRouteLoadingProvider } from "./MediaRouteLoadingProvider";
import SessionTokenMonitor from "./SessionTokenMonitor";

/**
 * Client-side wrapper for NextAuth's SessionProvider so client components
 * can call `useSession()`. Mount inside the root layout.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <MediaRouteLoadingProvider>
        {/* <AutoSignOutOnExit /> */}
        <SessionTokenMonitor />
        <AwardUnlockNotifier />
        {children}
      </MediaRouteLoadingProvider>
    </SessionProvider>
  );
}
