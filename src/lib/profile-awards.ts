export interface ProfileAward {
  id: string;
  name: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  progressLabel: string;
  badgeCode: string;
  artIndex: number;
}

interface ProfileAwardsSummary {
  awards: ProfileAward[];
  unlockedCount: number;
  nextMilestone: string;
}

type AwardCategory = "ratings" | "reviews" | "total";

interface AwardBlueprint {
  id: string;
  name: string;
  description: string;
  requirement: string;
  target: number;
  current?: number;
  unlocked?: boolean;
  progressLabel?: string;
  badgeCode: string;
  artIndex: number;
}

const RATING_THRESHOLDS = [
  1, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300,
] as const;
const REVIEW_THRESHOLDS = [
  1, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300,
] as const;
const CONTRIBUTION_THRESHOLDS = [
  10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 300,
] as const;

const RATING_TITLES = [
  "First Rater",
  "Casual Rater",
  "Active Rater",
  "Movie Scorer",
  "Score Keeper",
  "Rating Regular",
  "Screen Rater",
  "Cine Rater",
  "Film Ranker",
  "Score Specialist",
  "Rating Veteran",
  "Movie Judge",
  "Master Rater",
  "Elite Ranker",
  "Legendary Rater",
  "Hall of Fame Rater",
] as const;

const REVIEW_TITLES = [
  "Review Apprentice",
  "Review Novice",
  "Review Writer",
  "Review Columnist",
  "Review Analyst",
  "Review Specialist",
  "Review Commentator",
  "Review Scholar",
  "Review Editor",
  "Review Authority",
  "Review Veteran",
  "Review Master",
  "Review Virtuoso",
  "Review Director",
  "Review Legend",
  "Review Icon",
] as const;

const TOTAL_TITLES = [
  "Critic in Training",
  "Associate Critic",
  "Certified Critic",
  "Working Critic",
  "Trusted Critic",
  "Featured Critic",
  "Established Critic",
  "Distinguished Critic",
  "Acclaimed Critic",
  "Premier Critic",
  "Veteran Critic",
  "Chief Critic",
  "Movie Critic",
  "Senior Movie Critic",
] as const;

function progressCount(current: number, target: number) {
  return `${Math.min(current, target)}/${target}`;
}

function createAwardSet(
  category: AwardCategory,
  thresholds: readonly number[],
  titles: readonly string[],
  current: number,
  offset: number,
) {
  return thresholds.map((target, index): AwardBlueprint => {
    const title = titles[index];
    const sequence = String(index + 1).padStart(2, "0");

    if (category === "ratings") {
      return {
        id: `ratings-${target}`,
        name: title,
        description: `Built momentum by rating ${target} title${target === 1 ? "" : "s"}.`,
        requirement: `Submit ${target} rating${target === 1 ? "" : "s"}`,
        target,
        current,
        badgeCode: `RT-${sequence}`,
        artIndex: offset + index,
      };
    }

    if (category === "reviews") {
      return {
        id: `reviews-${target}`,
        name: title,
        description: `Shared ${target} written review${target === 1 ? "" : "s"} with the community.`,
        requirement: `Write ${target} review${target === 1 ? "" : "s"}`,
        target,
        current,
        badgeCode: `RV-${sequence}`,
        artIndex: offset + index,
      };
    }

    return {
      id: `total-${target}`,
      name: title,
      description:
        title === "Genuine Movie Critic"
          ? "Reached true critic status with 300 total ratings and reviews."
          : `Reached ${target} total contribution${target === 1 ? "" : "s"} across ratings and reviews.`,
      requirement:
        title === "Genuine Movie Critic"
          ? "Reach 300 total contributions"
          : `Reach ${target} total contribution${target === 1 ? "" : "s"}`,
      target,
      current,
      badgeCode: `MX-${sequence}`,
      artIndex: offset + index,
    };
  });
}

function createContributionAwardSet(
  ratingsCount: number,
  reviewsCount: number,
  offset: number,
) {
  return CONTRIBUTION_THRESHOLDS.map((target, index): AwardBlueprint => {
    const title = TOTAL_TITLES[index];
    const sequence = String(index + 1).padStart(2, "0");
    const unlocked = ratingsCount >= target && reviewsCount >= target;

    return {
      id: `total-${target}`,
      name: title,
      description:
        target === 300
          ? `Reached ${target} ratings and ${target} reviews to earn true critic status.`
          : `Reached ${target} ratings and ${target} reviews as a balanced contributor.`,
      requirement: `Reach ${target} ratings and ${target} reviews`,
      target,
      unlocked,
      progressLabel: `${Math.min(ratingsCount, target)}/${target} ratings • ${Math.min(reviewsCount, target)}/${target} reviews`,
      badgeCode: `MX-${sequence}`,
      artIndex: offset + index,
    };
  });
}

export function buildProfileAwards(
  ratingsCount: number,
  reviewsCount: number,
): ProfileAwardsSummary {
  const blueprints = [
    ...createAwardSet(
      "ratings",
      RATING_THRESHOLDS,
      RATING_TITLES,
      ratingsCount,
      0,
    ),
    ...createAwardSet(
      "reviews",
      REVIEW_THRESHOLDS,
      REVIEW_TITLES,
      reviewsCount,
      RATING_THRESHOLDS.length,
    ),
    ...createContributionAwardSet(
      ratingsCount,
      reviewsCount,
      RATING_THRESHOLDS.length + REVIEW_THRESHOLDS.length,
    ),
  ];

  const awards: ProfileAward[] = blueprints.map((award) => ({
    id: award.id,
    name: award.name,
    description: award.description,
    requirement: award.requirement,
    unlocked: award.unlocked ?? (award.current ?? 0) >= award.target,
    progressLabel: award.progressLabel ?? progressCount(award.current ?? 0, award.target),
    badgeCode: award.badgeCode,
    artIndex: award.artIndex,
  }));

  const unlockedCount = awards.filter((award) => award.unlocked).length;
  const nextLockedAward = awards.find((award) => !award.unlocked);
  const nextMilestone = nextLockedAward
    ? `Next award: ${nextLockedAward.name} (${nextLockedAward.requirement})`
    : "All 100 awards unlocked. Absolute cinema.";

  return {
    awards,
    unlockedCount,
    nextMilestone,
  };
}
