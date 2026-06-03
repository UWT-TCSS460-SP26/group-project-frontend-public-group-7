"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

import MediaRouteLoadingOverlay from "@/components/MediaRouteLoadingOverlay";

interface MediaRouteLoadingContextValue {
  showLoadingOverlay: () => void;
  hideLoadingOverlay: () => void;
}

const MediaRouteLoadingContext = createContext<
  MediaRouteLoadingContextValue | undefined
>(undefined);

export function MediaRouteLoadingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  const value = useMemo(
    () => ({
      showLoadingOverlay: () => setIsLoading(true),
      hideLoadingOverlay: () => setIsLoading(false),
    }),
    [],
  );

  return (
    <MediaRouteLoadingContext.Provider value={value}>
      {children}
      {isLoading && <MediaRouteLoadingOverlay />}
    </MediaRouteLoadingContext.Provider>
  );
}

export function useMediaRouteLoading() {
  const context = useContext(MediaRouteLoadingContext);

  if (!context) {
    throw new Error(
      "useMediaRouteLoading must be used within a MediaRouteLoadingProvider",
    );
  }

  return context;
}
