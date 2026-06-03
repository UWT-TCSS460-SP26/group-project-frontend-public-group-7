import { getMovieById, getTVShowById } from "@/lib/fetchAPI";
import { getTitleRatings } from "@/lib/media-api";
import type { MovieDetail, TVShowDetail } from "@/types/backendObjects";
import type { MediaType, RatingListResponse } from "@/types/media";

export interface MediaPreviewData {
  detail: MovieDetail | TVShowDetail;
  ratings: RatingListResponse;
}

const previewDataCache = new Map<string, Promise<MediaPreviewData>>();

function getPreviewDataCacheKey(mediaId: number, mediaType: MediaType) {
  return `${mediaType}-${mediaId}`;
}

export function loadMediaPreviewData(
  mediaId: number,
  mediaType: MediaType,
): Promise<MediaPreviewData> {
  const cacheKey = getPreviewDataCacheKey(mediaId, mediaType);
  const cached = previewDataCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const request = Promise.all([
    mediaType === "movie" ? getMovieById(mediaId) : getTVShowById(mediaId),
    getTitleRatings(mediaId, mediaType),
  ])
    .then(([detail, ratings]) => ({ detail, ratings }))
    .catch((error) => {
      previewDataCache.delete(cacheKey);
      throw error;
    });

  previewDataCache.set(cacheKey, request);
  return request;
}

export function prefetchMediaPreviewData(
  mediaId: number,
  mediaType: MediaType,
) {
  void loadMediaPreviewData(mediaId, mediaType).catch(() => undefined);
}
