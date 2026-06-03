import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import type { MovieSummary, TVSummary } from "@/types/media";
import RouteLoadingLink from "@/components/RouteLoadingLink";
import {
  formatDisplayYear,
  formatDisplayYearFromDate,
} from "@/lib/format-display-year";
import { getGenreNameById } from "@/lib/media-filters";

type Props =
  | {
      type: "movie";
      item: MovieSummary;
      prioritizedGenreId?: string;
      seasonCount?: number | null;
      hrefOverride?: string;
    }
  | {
      type: "tv";
      item: TVSummary;
      prioritizedGenreId?: string;
      seasonCount?: number | null;
      hrefOverride?: string;
    };

export default function MediaCard({
  type,
  item,
  prioritizedGenreId,
  seasonCount,
  hrefOverride,
}: Props) {
  const fallbackPoster =
    type === "movie" ? "/movie-placeholder.svg" : "/tv-placeholder.svg";
  const year =
    type === "movie"
      ? formatDisplayYear((item as MovieSummary).releaseYear)
      : formatDisplayYearFromDate((item as TVSummary).firstAirDate);
  const meta = [
    year,
    type === "tv" && seasonCount
      ? `${seasonCount} season${seasonCount === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const href = hrefOverride ?? `/media/${type}/${item.id}`;
  const visibleGenres = (() => {
    const normalizedGenres = (item.genres ?? [])
      .map((genre) => ({
        ...genre,
        name: genre.name || getGenreNameById(genre.id),
      }))
      .filter((genre) => Boolean(genre.name));

    if (!prioritizedGenreId?.trim()) {
      return normalizedGenres.slice(0, 2);
    }

    const prioritizedGenre = normalizedGenres.find(
      (genre) => String(genre.id) === prioritizedGenreId.trim(),
    );

    if (!prioritizedGenre) {
      return normalizedGenres.slice(0, 2);
    }

    const remainingGenres = normalizedGenres.filter(
      (genre) => genre.id !== prioritizedGenre.id,
    );

    return [prioritizedGenre, ...remainingGenres].slice(0, 2);
  })();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea
        component={RouteLoadingLink}
        href={href}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={item.posterUrl ?? fallbackPoster}
            alt={item.title}
            sx={{ aspectRatio: "2/3", objectFit: "cover" }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            gutterBottom
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.title}
          </Typography>
          {meta && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
            >
              {meta}
            </Typography>
          )}
          <Box sx={{ mb: 1 }}>
            {visibleGenres.map((genre) => (
              <Chip
                key={genre.id}
                label={genre.name}
                size="small"
                sx={{ mr: 0.5, mb: 0.5, fontSize: "0.65rem" }}
              />
            ))}
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.overview}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
