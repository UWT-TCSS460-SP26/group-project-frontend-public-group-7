import { API_BASE } from "@/lib/api";
import { buildProfileAwards, type ProfileAward } from "@/lib/profile-awards";
import type { MyRatingListResponse, MyReviewListResponse } from "@/types/media";

export const AWARD_UNLOCK_EVENT = "profile-awards:unlocked";

export function getAwardUserKey(user?: {
  id?: string | null;
  email?: string | null;
  name?: string | null;
}) {
  return user?.id || user?.email || user?.name || null;
}

export function getAwardStorageKey(userKey: string) {
  return `profile-awards:${userKey}`;
}

export function readSeenAwardIds(storageKey: string) {
  const stored = window.localStorage.getItem(storageKey);

  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeSeenAwardIds(storageKey: string, awardIds: string[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(awardIds));
}

export function dispatchAwardUnlockEvent(awards: ProfileAward[]) {
  window.dispatchEvent(
    new CustomEvent<{ awards: ProfileAward[] }>(AWARD_UNLOCK_EVENT, {
      detail: { awards },
    }),
  );
}

async function fetchAwardCounts(accessToken: string) {
  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
  };

  const [ratingsResponse, reviewsResponse] = await Promise.all([
    fetch(`${API_BASE}/v1/ratings/me?page=1`, {
      headers: authHeaders,
      cache: "no-store",
    }),
    fetch(`${API_BASE}/v1/reviews/me?page=1`, {
      headers: authHeaders,
      cache: "no-store",
    }),
  ]);

  if (!ratingsResponse.ok || !reviewsResponse.ok) {
    throw new Error("Failed to refresh award progress.");
  }

  const ratingsData = (await ratingsResponse.json()) as MyRatingListResponse;
  const reviewsData = (await reviewsResponse.json()) as MyReviewListResponse;

  return {
    ratingsCount: ratingsData.totalRatings ?? 0,
    reviewsCount: reviewsData.totalReviews ?? 0,
  };
}

export async function initializeSeenAwards(
  accessToken: string,
  storageKey: string,
) {
  const seenIds = readSeenAwardIds(storageKey);

  if (seenIds !== null) return;

  const { ratingsCount, reviewsCount } = await fetchAwardCounts(accessToken);
  const unlockedIds = buildProfileAwards(ratingsCount, reviewsCount).awards
    .filter((award) => award.unlocked)
    .map((award) => award.id);

  writeSeenAwardIds(storageKey, unlockedIds);
}

export async function checkForNewAwards(
  accessToken: string,
  storageKey: string,
) {
  const { ratingsCount, reviewsCount } = await fetchAwardCounts(accessToken);
  const awards = buildProfileAwards(ratingsCount, reviewsCount).awards;
  const unlockedAwards = awards.filter((award) => award.unlocked);
  const unlockedIds = unlockedAwards.map((award) => award.id);
  const seenIds = readSeenAwardIds(storageKey) ?? [];
  const newlyUnlocked = unlockedAwards.filter(
    (award) => !seenIds.includes(award.id),
  );

  writeSeenAwardIds(storageKey, unlockedIds);

  if (newlyUnlocked.length > 0) {
    dispatchAwardUnlockEvent(newlyUnlocked);
  }

  return newlyUnlocked;
}
