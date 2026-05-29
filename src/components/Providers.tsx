"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
// import AutoSignOutOnExit from "./AutoSignOutOnExit";
import AwardUnlockNotifier from "./AwardUnlockNotifier";

/**
 * Client-side wrapper for NextAuth's SessionProvider so client components
 * can call `useSession()`. Mount inside the root layout.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {/* <AutoSignOutOnExit /> */}
      <AwardUnlockNotifier />
      {children}
    </SessionProvider>
  );
}
