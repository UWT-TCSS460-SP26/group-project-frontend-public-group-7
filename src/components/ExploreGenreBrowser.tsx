"use client";

import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type WheelEvent,
} from "react";

import MediaPreviewModal from "@/components/MediaPreviewModal";
import { useMediaRouteLoading } from "@/components/MediaRouteLoadingProvider";
import {
  formatDisplayYear,
  formatDisplayYearFromDate,
} from "@/lib/format-display-year";
import type { GenreMediaItem } from "@/lib/group-media-by-genre";
import { prefetchMediaPreviewData } from "@/lib/media-preview-data";
import type { MovieSummary, TVSummary } from "@/types/media";

const TITLES_PER_PAGE = 36;
const SCROLL_EDGE_TOLERANCE_PX = 2;
const WHEEL_HANDOFF_IDLE_MS = 180;

type ScrollOwner = "page" | "titles";
type ScrollDirection = "up" | "down";
type PendingHandoff = "page-to-titles" | "titles-to-page" | null;

function getScrollableAncestor(element: HTMLElement | null) {
  let parent = element?.parentElement ?? null;

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    const canScroll =
      /(auto|scroll)/.test(overflowY) &&
      parent.scrollHeight > parent.clientHeight;

    if (canScroll) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}

function getPageScroller(element: HTMLElement) {
  return (
    getScrollableAncestor(element) ??
    (document.scrollingElement as HTMLElement | null)
  );
}

function getMaxScrollTop(element: HTMLElement) {
  return Math.max(0, element.scrollHeight - element.clientHeight);
}

function isScrollableY(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight + SCROLL_EDGE_TOLERANCE_PX;
}

function isScrolledToTop(element: HTMLElement) {
  return element.scrollTop <= SCROLL_EDGE_TOLERANCE_PX;
}

function isScrolledToBottom(element: HTMLElement) {
  return (
    element.scrollTop + element.clientHeight >=
    element.scrollHeight - SCROLL_EDGE_TOLERANCE_PX
  );
}

function scrollElementBy(element: HTMLElement, deltaY: number) {
  element.scrollTop = Math.min(
    getMaxScrollTop(element),
    Math.max(0, element.scrollTop + deltaY),
  );
}

interface ExploreGenreBrowserProps {
  genreRows: [string, GenreMediaItem[]][];
}

export default function ExploreGenreBrowser({
  genreRows,
}: ExploreGenreBrowserProps) {
  const [selectedGenre, setSelectedGenre] = useState(
    () => genreRows[0]?.[0] ?? "",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<GenreMediaItem | null>(null);
  const [titlesLocked, setTitlesLocked] = useState(true);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const titleScrollRef = useRef<HTMLDivElement | null>(null);
  const pageScrollerRef = useRef<HTMLElement | null>(null);
  const wheelIdleTimerRef = useRef<number | null>(null);

  const scrollOwnerRef = useRef<ScrollOwner>("page");
  const pendingHandoffRef = useRef<PendingHandoff>(null);

  const canResumeTitlesImmediatelyRef = useRef(false);

  const { showLoadingOverlay } = useMediaRouteLoading();

  const activeGenre = genreRows.some(([genre]) => genre === selectedGenre)
    ? selectedGenre
    : (genreRows[0]?.[0] ?? "");

  const activeItems = useMemo(
    () => genreRows.find(([genre]) => genre === activeGenre)?.[1] ?? [],
    [activeGenre, genreRows],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(activeItems.length / TITLES_PER_PAGE),
  );

  const visibleItems = activeItems.slice(
    (currentPage - 1) * TITLES_PER_PAGE,
    currentPage * TITLES_PER_PAGE,
  );

  useEffect(() => {
    const titleScroller = titleScrollRef.current;

    if (!titleScroller) {
      return undefined;
    }

    const foundPageScroller = getPageScroller(titleScroller);

    if (!foundPageScroller) {
      return undefined;
    }

    const pageScroller: HTMLElement = foundPageScroller;
    pageScrollerRef.current = pageScroller;

    function handlePageScroll() {
      if (!isScrolledToBottom(pageScroller)) {
        canResumeTitlesImmediatelyRef.current = false;
        pendingHandoffRef.current = null;
        setScrollOwner("page");
      }
    }

    const target: Window | HTMLElement =
      pageScroller === document.scrollingElement ? window : pageScroller;

    target.addEventListener("scroll", handlePageScroll, { passive: true });

    return () => {
      target.removeEventListener("scroll", handlePageScroll);
      clearWheelIdleTimer();
    };
  }, []);

  function setScrollOwner(owner: ScrollOwner) {
    scrollOwnerRef.current = owner;
    setTitlesLocked(owner === "page");
  }

  function clearWheelIdleTimer() {
    if (wheelIdleTimerRef.current !== null) {
      window.clearTimeout(wheelIdleTimerRef.current);
      wheelIdleTimerRef.current = null;
    }
  }

  function cancelPendingHandoff() {
    clearWheelIdleTimer();
    pendingHandoffRef.current = null;
  }

  function queuePendingHandoff(
    pageScroller: HTMLElement,
    titleScroller: HTMLElement,
    pendingHandoff: Exclude<PendingHandoff, null>,
  ) {
    clearWheelIdleTimer();

    pendingHandoffRef.current = pendingHandoff;

    wheelIdleTimerRef.current = window.setTimeout(() => {
      const pending = pendingHandoffRef.current;
      const owner = scrollOwnerRef.current;

      if (
        pending === "page-to-titles" &&
        owner === "page" &&
        isScrolledToBottom(pageScroller)
      ) {
        pendingHandoffRef.current = null;
        canResumeTitlesImmediatelyRef.current = false;
        setScrollOwner("titles");
      }

      if (
        pending === "titles-to-page" &&
        owner === "titles" &&
        isScrolledToTop(titleScroller)
      ) {
        pendingHandoffRef.current = null;
        canResumeTitlesImmediatelyRef.current =
          isScrolledToBottom(pageScroller);
        setScrollOwner("page");
      }

      wheelIdleTimerRef.current = null;
    }, WHEEL_HANDOFF_IDLE_MS);
  }

  function resetScrollHandoffState() {
    cancelPendingHandoff();
    canResumeTitlesImmediatelyRef.current = false;
    setScrollOwner("page");
  }

  function keepExploreControlIfPageIsBottom() {
    const titleScroller = titleScrollRef.current;
    const pageScroller =
      pageScrollerRef.current ??
      (titleScroller ? getPageScroller(titleScroller) : null);

    cancelPendingHandoff();
    canResumeTitlesImmediatelyRef.current = false;

    if (pageScroller && isScrolledToBottom(pageScroller)) {
      setScrollOwner("titles");
      return;
    }

    setScrollOwner("page");
  }

  function handleGenreClick(genre: string) {
    setSelectedGenre(genre);
    setCurrentPage(1);
    titleScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
    keepExploreControlIfPageIsBottom();
  }

  function handlePageChange(_: ChangeEvent<unknown>, value: number) {
    setCurrentPage(value);
    titleScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    keepExploreControlIfPageIsBottom();
  }

  function handleTitleWheel(event: WheelEvent<HTMLDivElement>) {
    const titleScroller = titleScrollRef.current;

    if (!titleScroller || event.deltaY === 0) {
      return;
    }

    const pageScroller =
      pageScrollerRef.current ?? getPageScroller(titleScroller);

    if (!pageScroller) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const direction: ScrollDirection = event.deltaY > 0 ? "down" : "up";
    const owner = scrollOwnerRef.current;

    if (!isScrollableY(titleScroller)) {
      resetScrollHandoffState();
      scrollElementBy(pageScroller, event.deltaY);
      return;
    }

    if (owner === "page") {
      setTitlesLocked(true);

      if (direction === "down") {
        if (isScrolledToBottom(pageScroller)) {
          pageScroller.scrollTop = getMaxScrollTop(pageScroller);

          if (canResumeTitlesImmediatelyRef.current) {
            cancelPendingHandoff();
            canResumeTitlesImmediatelyRef.current = false;
            setScrollOwner("titles");
            scrollElementBy(titleScroller, event.deltaY);
            return;
          }

          queuePendingHandoff(pageScroller, titleScroller, "page-to-titles");
          return;
        }

        cancelPendingHandoff();
        canResumeTitlesImmediatelyRef.current = false;
        scrollElementBy(pageScroller, event.deltaY);

        if (isScrolledToBottom(pageScroller)) {
          pageScroller.scrollTop = getMaxScrollTop(pageScroller);
          queuePendingHandoff(pageScroller, titleScroller, "page-to-titles");
        }

        return;
      }

      cancelPendingHandoff();
      canResumeTitlesImmediatelyRef.current = false;
      scrollElementBy(pageScroller, event.deltaY);
      return;
    }

    setTitlesLocked(false);

    if (direction === "down") {
      cancelPendingHandoff();
      canResumeTitlesImmediatelyRef.current = false;
      scrollElementBy(titleScroller, event.deltaY);
      return;
    }

    if (isScrolledToTop(titleScroller)) {
      titleScroller.scrollTop = 0;
      queuePendingHandoff(pageScroller, titleScroller, "titles-to-page");
      return;
    }

    cancelPendingHandoff();
    canResumeTitlesImmediatelyRef.current = false;
    scrollElementBy(titleScroller, event.deltaY);

    if (isScrolledToTop(titleScroller)) {
      titleScroller.scrollTop = 0;
      queuePendingHandoff(pageScroller, titleScroller, "titles-to-page");
    }
  }

  return (
    <Box
      ref={sectionRef}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr)" },
        gap: { xs: 2.5, md: 3.5 },
        height: { md: "100%" },
        minHeight: 0,
        alignItems: "start",
      }}
    >
      <Box
        sx={{
          position: "static",
          mt: { lg: 4.25 },
          display: "flex",
          flexDirection: "column",
          height: { xs: 320, lg: "calc(100% - 34px)" },
          minHeight: 0,
          p: 1.75,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "rgba(245,197,24,0.2)",
          borderRadius: 4,
          bgcolor: "rgba(22,22,20,0.96)",
          boxShadow:
            "0 20px 44px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", letterSpacing: 1.2 }}
        >
          Genres
        </Typography>

        <Stack
          direction="column"
          spacing={0.8}
          sx={{
            mt: 1.25,
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {genreRows.map(([genre]) => {
            const selected = genre === activeGenre;

            return (
              <Button
                key={genre}
                variant={selected ? "contained" : "outlined"}
                color="primary"
                onClick={() => handleGenreClick(genre)}
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0,
                  width: "100%",
                  minWidth: "100%",
                  minHeight: 54,
                  height: 54,
                  borderRadius: 2.4,
                  px: 1.5,
                  py: 0,
                  fontSize: { xs: "1.12rem", md: "1.22rem" },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  textAlign: "center",
                  textTransform: "none",
                  borderColor: selected
                    ? "rgba(255,214,61,0.75)"
                    : "rgba(245,197,24,0.22)",
                  bgcolor: selected
                    ? "primary.main"
                    : "rgba(255,255,255,0.035)",
                  boxShadow: selected
                    ? "0 10px 22px rgba(245,197,24,0.18), inset 0 1px 0 rgba(255,255,255,0.24)"
                    : "0 8px 18px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.06)",
                  "&:hover": {
                    borderColor: "rgba(255,214,61,0.7)",
                    bgcolor: selected ? "primary.main" : "rgba(245,197,24,0.1)",
                    boxShadow:
                      "0 10px 24px rgba(245,197,24,0.14), inset 0 1px 0 rgba(255,255,255,0.12)",
                  },
                }}
              >
                {genre}
              </Button>
            );
          })}
        </Stack>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: { md: "100%" },
          minHeight: 0,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {activeGenre}
            </Typography>
          </Box>

          {totalPages > 1 ? (
            <Typography variant="body2" color="text.secondary">
              Page {currentPage} of {totalPages}
            </Typography>
          ) : null}
        </Stack>

        <Box
          ref={titleScrollRef}
          onWheelCapture={handleTitleWheel}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: { md: titlesLocked ? "hidden" : "auto" },
            overscrollBehavior: "contain",
            pr: { md: 1 },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
                lg: "repeat(6, minmax(0, 1fr))",
              },
              gap: { xs: 1.25, md: 1.75 },
            }}
          >
            {visibleItems.map((item) => {
              const year =
                item._type === "movie"
                  ? formatDisplayYear((item as MovieSummary).releaseYear)
                  : formatDisplayYearFromDate((item as TVSummary).firstAirDate);

              const fallbackPoster =
                item._type === "movie"
                  ? "/movie-placeholder.svg"
                  : "/tv-placeholder.svg";

              return (
                <Card
                  key={`${activeGenre}-${item._type}-${item.id}`}
                  sx={{
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <CardActionArea
                    onFocus={() =>
                      prefetchMediaPreviewData(item.id, item._type)
                    }
                    onMouseEnter={() =>
                      prefetchMediaPreviewData(item.id, item._type)
                    }
                    onClick={() => {
                      showLoadingOverlay();
                      setSelectedItem(item);
                    }}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={item.posterUrl ?? fallbackPoster}
                      alt={item.title}
                      sx={{ aspectRatio: "2/3", objectFit: "cover" }}
                    />

                    <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                      <Typography
                        variant="caption"
                        fontWeight={800}
                        display="block"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.title}
                      </Typography>

                      {year ? (
                        <Typography variant="caption" color="text.secondary">
                          {year}
                        </Typography>
                      ) : null}
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>

          {totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{ display: "flex", justifyContent: "center", mt: 3, pb: 1 }}
            />
          ) : null}
        </Box>
      </Box>

      <MediaPreviewModal
        mediaId={selectedItem?.id ?? null}
        mediaType={selectedItem?._type ?? "movie"}
        onClose={() => setSelectedItem(null)}
      />
    </Box>
  );
}
