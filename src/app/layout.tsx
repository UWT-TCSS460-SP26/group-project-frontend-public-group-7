import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

import AppOverlayFrame from "@/components/AppOverlayFrame";
import HomeInitialLoading from "@/components/HomeInitialLoading";
import HomeScreen from "@/components/HomeScreen";
import ThemeRegistry from "@/components/ThemeRegistry";
import Providers from "@/components/Providers";
import { APP_CONFIG } from "@/config";

export const metadata: Metadata = {
  title: APP_CONFIG.app.title,
  description: APP_CONFIG.app.description,
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeRegistry>
            <AppOverlayFrame
              home={
                <Suspense fallback={<HomeInitialLoading />}>
                  <HomeScreen />
                </Suspense>
              }
            >
              {children}
            </AppOverlayFrame>
          </ThemeRegistry>
        </Providers>
      </body>
    </html>
  );
}
