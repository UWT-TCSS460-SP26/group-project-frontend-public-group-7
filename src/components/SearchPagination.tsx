"use client";

import { Pagination } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMediaRouteLoading } from "@/components/MediaRouteLoadingProvider";

interface Props {
  q: string;
  page: number;
  totalPages: number;
  includeMovies: boolean;
  includeTV: boolean;
  year?: string;
  genreId?: string;
}

export default function SearchPagination({
  q,
  page,
  totalPages,
  includeMovies,
  includeTV,
  year,
  genreId,
}: Props) {
  const router = useRouter();
  const { showLoadingOverlay } = useMediaRouteLoading();

  function buildHref(value: number) {
    const params = new URLSearchParams({ q, page: String(value) });
    if (includeMovies) params.set("movies", "1");
    if (includeTV) params.set("tv", "1");
    if (year?.trim()) params.set("year", year.trim());
    if (genreId?.trim()) params.set("genreId", genreId.trim());
    return `/search?${params}`;
  }

  useEffect(() => {
    function buildPrefetchHref(value: number) {
      const params = new URLSearchParams({ q, page: String(value) });
      if (includeMovies) params.set("movies", "1");
      if (includeTV) params.set("tv", "1");
      if (year?.trim()) params.set("year", year.trim());
      if (genreId?.trim()) params.set("genreId", genreId.trim());
      return `/search?${params}`;
    }

    [page - 1, page + 1]
      .filter((nextPage) => nextPage >= 1 && nextPage <= totalPages)
      .forEach((nextPage) => router.prefetch(buildPrefetchHref(nextPage)));
  }, [genreId, includeMovies, includeTV, page, q, router, totalPages, year]);

  function handleChange(_: React.ChangeEvent<unknown>, value: number) {
    showLoadingOverlay();
    router.push(buildHref(value));
  }

  return (
    <Pagination
      count={totalPages}
      page={page}
      onChange={handleChange}
      color="primary"
      sx={{ display: "flex", justifyContent: "center" }}
    />
  );
}
