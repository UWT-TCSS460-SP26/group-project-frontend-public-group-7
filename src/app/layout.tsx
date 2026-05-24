import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

import ThemeRegistry from "@/components/ThemeRegistry";
import Providers from "@/components/Providers";
import { APP_CONFIG } from "@/config";

export const metadata: Metadata = {
  title: APP_CONFIG.app.title,
  description: APP_CONFIG.app.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ThemeRegistry>{children}</ThemeRegistry>
        </Providers>
      </body>
    </html>
  );
}
