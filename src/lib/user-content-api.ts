import { API_BASE } from "./api";
import type {
  MyRatingListResponse,
  MyReviewListResponse,
  ReviewRecord,
  RatingRecord,
} from "@/types/media";

/**
 * Fetch ratings submitted by the authenticated user.
 */
export async function getMyRatings(
  accessToken: string,
  page = 1,
): Promise<MyRatingListResponse> {
  const response = await fetch(`${API_BASE}/v1/ratings/me?page=${page}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ratings: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch all ratings submitted by the authenticated user.
 */
export async function getAllMyRatings(
  accessToken: string,
  initialPage?: MyRatingListResponse,
): Promise<RatingRecord[]> {
  const firstPage = initialPage ?? (await getMyRatings(accessToken, 1));

  if (firstPage.totalPages <= 1) {
    return firstPage.results;
  }

  const remainingPages = await Promise.allSettled(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      getMyRatings(accessToken, index + 2),
    ),
  );

  return [
    ...firstPage.results,
    ...remainingPages
      .filter(
        (result): result is PromiseFulfilledResult<MyRatingListResponse> =>
          result.status === "fulfilled",
      )
      .flatMap((result) => result.value.results),
  ];
}

/**
 * Fetch reviews written by the authenticated user.
 */
export async function getMyReviews(
  accessToken: string,
  page = 1,
): Promise<MyReviewListResponse> {
  const response = await fetch(`${API_BASE}/v1/reviews/me?page=${page}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.status}`);
  }

  return response.json();
}

/**
 * Update a review.
 */
export async function updateReview(
  accessToken: string,
  reviewId: number,
  data: { title?: string; body: string },
): Promise<ReviewRecord> {
  const response = await fetch(`${API_BASE}/v1/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update review: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete a review.
 */
export async function deleteReview(
  accessToken: string,
  reviewId: number,
): Promise<void> {
  const response = await fetch(`${API_BASE}/v1/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete review: ${response.status}`);
  }
}

/**
 * Update a rating score.
 */
export async function updateRating(
  accessToken: string,
  ratingId: number,
  score: number,
): Promise<RatingRecord> {
  const response = await fetch(`${API_BASE}/v1/ratings/${ratingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ score }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update rating: ${response.status}`);
  }

  return response.json();
}

/**
 * Delete a rating.
 */
export async function deleteRating(
  accessToken: string,
  ratingId: number,
): Promise<void> {
  const response = await fetch(`${API_BASE}/v1/ratings/${ratingId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete rating: ${response.status}`);
  }
}
