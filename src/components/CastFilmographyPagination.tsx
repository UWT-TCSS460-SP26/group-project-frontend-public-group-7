"use client";

import { Box, Pagination } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import { useMediaRouteLoading } from "@/components/MediaRouteLoadingProvider";
import { safeRouterPrefetch } from "@/lib/safe-router-prefetch";

const SCROLL_RESTORE_KEY_PREFIX = "cast-filmography-pagination-scroll";
const TITLES_PER_PAGE = 12;
const SPARSE_PAGE_THRESHOLD = 12;

type ScrollMode = "anchor" | "bottom" | "top";

function getScrollContainer(element: HTMLElement | null) {
  return element?.closest<HTMLElement>("[data-route-scroll-container]") ?? null;
}

function scrollToTop(element: HTMLElement | null) {
  const scrollContainer = getScrollContainer(element);

  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: "auto" });
    return;
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function scrollToBottom(element: HTMLElement | null) {
  const scrollContainer = getScrollContainer(element);

  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "auto",
    });
    return;
  }

  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "auto",
  });
}

function adjustScrollBy(element: HTMLElement | null, offset: number) {
  const scrollContainer = getScrollContainer(element);

  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: scrollContainer.scrollTop + offset,
      behavior: "auto",
    });
    return;
  }

  window.scrollTo({
    top: window.scrollY + offset,
    behavior: "auto",
  });
}

interface CastFilmographyPaginationProps {
  currentPage: number;
  pageParam: string;
  totalResults: number;
  totalPages: number;
}

export default function CastFilmographyPagination({
  currentPage,
  pageParam,
  totalResults,
  totalPages,
}: CastFilmographyPaginationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showLoadingOverlay } = useMediaRouteLoading();
  const paginationRef = useRef<HTMLDivElement | null>(null);

  const scrollRestoreKey = `${SCROLL_RESTORE_KEY_PREFIX}-${pageParam}`;

  function buildHref(value: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (value <= 1) {
      params.delete(pageParam);
    } else {
      params.set(pageParam, String(value));
    }

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  useEffect(() => {
    function buildPrefetchHref(value: number) {
      const params = new URLSearchParams(searchParams.toString());

      if (value <= 1) {
        params.delete(pageParam);
      } else {
        params.set(pageParam, String(value));
      }

      const queryString = params.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    }

    [currentPage - 1, currentPage + 1]
      .filter((page) => page >= 1 && page <= totalPages)
      .forEach((page) => safeRouterPrefetch(router, buildPrefetchHref(page)));
  }, [currentPage, pageParam, pathname, router, searchParams, totalPages]);

  useLayoutEffect(() => {
    const storedValue = sessionStorage.getItem(scrollRestoreKey);

    if (!storedValue) {
      return;
    }

    try {
      const restore = JSON.parse(storedValue) as {
        mode?: ScrollMode;
        pathname?: string;
        targetPage?: number;
        top?: number;
      };

      if (restore.pathname !== pathname || restore.targetPage !== currentPage) {
        return;
      }

      const restoreMode = restore.mode ?? "anchor";
      const restoreTop = restore.top;
      sessionStorage.removeItem(scrollRestoreKey);
      window.requestAnimationFrame(() => {
        if (restoreMode === "top") {
          scrollToTop(paginationRef.current);
          return;
        }

        if (restoreMode === "bottom") {
          scrollToBottom(paginationRef.current);
          return;
        }

        const currentTop = paginationRef.current?.getBoundingClientRect().top;

        if (typeof currentTop !== "number" || typeof restoreTop !== "number") {
          return;
        }

        adjustScrollBy(paginationRef.current, currentTop - restoreTop);
      });
    } catch {
      sessionStorage.removeItem(scrollRestoreKey);
    }
  }, [currentPage, pathname, scrollRestoreKey]);

  function getTargetPageCount(value: number) {
    const startIndex = (value - 1) * TITLES_PER_PAGE;
    return Math.max(0, Math.min(TITLES_PER_PAGE, totalResults - startIndex));
  }

  function getScrollMode(value: number): ScrollMode {
    const isSparseTargetPage =
      getTargetPageCount(value) < SPARSE_PAGE_THRESHOLD;

    if (pageParam === "moviePage" && isSparseTargetPage) {
      return "top";
    }

    if (pageParam === "tvPage" && value === totalPages && isSparseTargetPage) {
      return "bottom";
    }

    return "anchor";
  }

  function handleChange(_: React.ChangeEvent<unknown>, value: number) {
    const href = buildHref(value);
    const paginationTop = paginationRef.current?.getBoundingClientRect().top;
    const mode = getScrollMode(value);

    if (typeof paginationTop === "number") {
      sessionStorage.setItem(
        scrollRestoreKey,
        JSON.stringify({
          mode,
          pathname,
          targetPage: value,
          top: paginationTop,
        }),
      );
    }

    showLoadingOverlay();
    router.push(href, { scroll: false });
  }

  return (
    <Box
      ref={paginationRef}
      sx={{ display: "flex", justifyContent: "center", mt: 3 }}
    >
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={handleChange}
        color="primary"
      />
    </Box>
  );
}
