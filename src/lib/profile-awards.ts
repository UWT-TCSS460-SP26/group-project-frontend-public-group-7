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
  current: number;
  badgeCode: string;
  artIndex: number;
}

const RATING_THRESHOLDS = [
  1, 2, 3, 5, 7, 10, 12, 15, 18, 20, 24, 28, 32, 36, 40, 45, 50, 55, 60, 66, 72,
  78, 84, 90, 100, 110, 120, 135, 150, 165, 180, 200, 225, 250,
] as const;
const REVIEW_THRESHOLDS = [
  1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 31, 34, 37, 40, 45,
  50, 55, 60, 66, 72, 78, 84, 90, 96, 110, 125, 140,
] as const;
const TOTAL_THRESHOLDS = [
  3, 5, 8, 10, 12, 15, 18, 20, 24, 28, 32, 36, 40, 45, 50, 56, 62, 68, 74, 80,
  90, 100, 110, 120, 132, 144, 156, 168, 180, 200, 220, 240, 300,
] as const;

const RATING_TITLES = [
  "First Frame",
  "Popcorn Scout",
  "Scene Sampler",
  "Marquee Marker",
  "Neon Notebook",
  "Taste Tester",
  "Cue Card Captain",
  "Feature Tracker",
  "Silver Screen Scout",
  "Spotlight Streak",
  "Cinema Current",
  "Plotline Pilot",
  "Trailer Tactician",
  "Reel Reactor",
  "Credits Chaser",
  "Rating Ranger",
  "Film Flame",
  "Blockbuster Beacon",
  "Storyline Surfer",
  "Premiere Pulse",
  "Celluloid Charger",
  "Title Tactician",
  "Projector Pro",
  "Sequence Specialist",
  "Midnight Marquee",
  "Festival Favorite",
  "Chart Climber",
  "Critic Circuit",
  "Golden Gauge",
  "Reputation Reel",
  "Canon Crafter",
  "Legacy Lister",
  "Hall of Frames",
  "Infinite Watchlist",
] as const;

const REVIEW_TITLES = [
  "Fresh Voice",
  "Quick Take",
  "Comment Composer",
  "Thoughtful Thread",
  "Scene Critic",
  "Dialogue Diver",
  "Narrative Note",
  "Review Rookie",
  "Opinion Architect",
  "Reel Reporter",
  "Draft Director",
  "Script Scribe",
  "Column Curator",
  "Frame Philosopher",
  "Monologue Maker",
  "Deep Focus",
  "Perspective Pilot",
  "Insight Igniter",
  "Plot Professor",
  "Theme Tracker",
  "Essay Engine",
  "Voice Vanguard",
  "Spotlight Scholar",
  "Review Resonance",
  "Critique Current",
  "Cinematic Columnist",
  "Lens Lecturer",
  "Story Analyst",
  "Dialogue Doctor",
  "Auteur Advocate",
  "Cinema Essayist",
  "Golden Pen",
  "Archive Author",
] as const;

const TOTAL_TITLES = [
  "Collection Curator",
  "Watchlist Walker",
  "After-Credits Ace",
  "Double Feature",
  "Weekend Warrior",
  "Screen Sprinter",
  "Signal Booster",
  "Catalog Keeper",
  "Momentum Maker",
  "Queue Builder",
  "Library Lifter",
  "Marathon Mode",
  "Discovery Drive",
  "Binge Builder",
  "Genre Glider",
  "Vault Voyager",
  "Mood Mapper",
  "Premiere Pathfinder",
  "Seasoned Selector",
  "Taste Trailblazer",
  "Night Owl Nomad",
  "Couch Commander",
  "Projector Pathfinder",
  "Reel Rhythm",
  "Pulse Pioneer",
  "Scene Synthesizer",
  "Screen Strategist",
  "Chronicle Crafter",
  "Signal Sage",
  "Orbit of Opinions",
  "Galaxy of Genres",
  "Legend Ledger",
  "Genuine Movie Critic",
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

export function buildProfileAwards(
  ratingsCount: number,
  reviewsCount: number,
): ProfileAwardsSummary {
  const totalContributions = ratingsCount + reviewsCount;

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
    ...createAwardSet(
      "total",
      TOTAL_THRESHOLDS,
      TOTAL_TITLES,
      totalContributions,
      RATING_THRESHOLDS.length + REVIEW_THRESHOLDS.length,
    ),
  ];

  const awards: ProfileAward[] = blueprints.map((award) => ({
    id: award.id,
    name: award.name,
    description: award.description,
    requirement: award.requirement,
    unlocked: award.current >= award.target,
    progressLabel: progressCount(award.current, award.target),
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
