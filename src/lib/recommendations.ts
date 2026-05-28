import { enrichedMovie, enrichedTV } from "@/lib/media-api";
import type { GenreMediaItem } from "@/lib/group-media-by-genre";
import type { MediaType, RatingRecord } from "@/types/media";

const MIN_RECOMMENDATION_SCORE = 7;
const MAX_SEED_TITLES = 6;
const MAX_SIMILAR_PER_SEED = 8;
const MAX_RECOMMENDATIONS = 20;

type RecommendationCandidate = {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  genres: Array<{ id: number; name?: string }>;
  releaseYear?: number | null;
  firstAirDate?: string | null;
  _type: MediaType;
  sourceTitles: Set<string>;
  weight: number;
};

function sortRatings(ratings: RatingRecord[]) {
  return [...ratings].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });
}

export async function getMovieRecommendationsFromRatings(
  ratings: RatingRecord[],
): Promise<Array<GenreMediaItem & { sourceTitles: string[] }>> {
  const sortedRatings = sortRatings(ratings);

  if (sortedRatings.length === 0) {
    return [];
  }

  const seedRatings = sortedRatings
    .filter((rating) => rating.score >= MIN_RECOMMENDATION_SCORE)
    .slice(0, MAX_SEED_TITLES);

  if (seedRatings.length === 0) {
    return [];
  }

  const ratedIds = new Set(
    sortedRatings.map((rating) => `${rating.mediaType}-${rating.tmdbId}`),
  );
  const recommendations = new Map<string, RecommendationCandidate>();

  const enrichedResults = await Promise.allSettled(
    seedRatings.map((rating) =>
      rating.mediaType === "movie"
        ? enrichedMovie(rating.tmdbId)
        : enrichedTV(rating.tmdbId),
    ),
  );

  enrichedResults.forEach((result, seedIndex) => {
    if (result.status !== "fulfilled") return;

    const seed = seedRatings[seedIndex];
    const seedTitle = result.value.tmdb.title || `Title ${seed.tmdbId}`;
    const similarTitles = result.value.tmdb.similar.slice(0, MAX_SIMILAR_PER_SEED);

    similarTitles.forEach((similar, similarIndex) => {
      const key = `${seed.mediaType}-${similar.id}`;
      if (ratedIds.has(key)) return;

      const existing = recommendations.get(key);
      const weightBoost =
        seed.score * 10 + (MAX_SIMILAR_PER_SEED - similarIndex);

      if (existing) {
        existing.weight += weightBoost;
        existing.sourceTitles.add(seedTitle);
        return;
      }

      if (seed.mediaType === "movie") {
        recommendations.set(key, {
          id: similar.id,
          title: similar.title,
          overview: "",
          releaseYear: similar.releaseYear,
          posterUrl: similar.posterUrl,
          backdropUrl: null,
          genres: [],
          _type: "movie",
          sourceTitles: new Set([seedTitle]),
          weight: weightBoost,
        });
        return;
      }

      recommendations.set(key, {
        id: similar.id,
        title: similar.title,
        overview: "",
        firstAirDate:
          typeof similar.releaseYear === "number"
            ? `${similar.releaseYear}-01-01`
            : null,
        posterUrl: similar.posterUrl,
        backdropUrl: null,
        genres: [],
        _type: "tv",
        sourceTitles: new Set([seedTitle]),
        weight: weightBoost,
      });
    });
  });

  return [...recommendations.values()]
    .sort((left, right) => {
      if (right.weight !== left.weight) {
        return right.weight - left.weight;
      }

      if (right.sourceTitles.size !== left.sourceTitles.size) {
        return right.sourceTitles.size - left.sourceTitles.size;
      }

      const rightYear =
        right._type === "movie"
          ? (right.releaseYear ?? 0)
          : Number((right.firstAirDate ?? "").slice(0, 4)) || 0;
      const leftYear =
        left._type === "movie"
          ? (left.releaseYear ?? 0)
          : Number((left.firstAirDate ?? "").slice(0, 4)) || 0;

      return rightYear - leftYear;
    })
    .slice(0, MAX_RECOMMENDATIONS)
    .map((title) => ({
      ...title,
      sourceTitles: [...title.sourceTitles],
    })) as Array<GenreMediaItem & { sourceTitles: string[] }>;
}
