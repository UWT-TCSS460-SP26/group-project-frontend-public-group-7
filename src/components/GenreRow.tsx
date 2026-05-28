"use client";

import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useState } from "react";
import HorizontalScroller from "@/components/HorizontalScroller";
import MediaPreviewModal from "@/components/MediaPreviewModal";
import {
  formatDisplayYear,
  formatDisplayYearFromDate,
} from "@/lib/format-display-year";
import type { GenreMediaItem } from "@/lib/group-media-by-genre";

import type { MovieSummary, TVSummary } from "@/types/media";

type MediaItem = GenreMediaItem;

interface Props {
  genre: string;
  items: MediaItem[];
  headingSx?: SxProps<Theme>;
}

export default function GenreRow({ genre, items, headingSx }: Props) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ mb: 1.5, color: "primary.main", ...headingSx }}
      >
        {genre}
      </Typography>

      <HorizontalScroller infinite={items.length >= 10}>
        {items.map((item) => {
          const year =
            item._type === "movie"
              ? formatDisplayYear((item as MovieSummary).releaseYear)
              : formatDisplayYearFromDate((item as TVSummary).firstAirDate);

          return (
            <Card
              key={`${item._type}-${item.id}`}
              sx={{ minWidth: 140, maxWidth: 140, flexShrink: 0 }}
            >
              <CardActionArea
                onClick={() => setSelectedItem(item)}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    image={
                      item.posterUrl ??
                      (item._type === "movie"
                        ? "/movie-placeholder.svg"
                        : "/tv-placeholder.svg")
                    }
                    alt={item.title}
                    sx={{ aspectRatio: "2/3", objectFit: "cover" }}
                  />
                </Box>
                <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                  <Typography
                    variant="caption"
                    fontWeight="bold"
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
                  {year && (
                    <Typography variant="caption" color="text.secondary">
                      {year}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </HorizontalScroller>

      <MediaPreviewModal
        mediaId={selectedItem?.id ?? null}
        mediaType={selectedItem?._type ?? "movie"}
        onClose={() => setSelectedItem(null)}
      />
    </Box>
  );
}
