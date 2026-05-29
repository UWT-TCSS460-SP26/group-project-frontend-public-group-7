export function formatRatingOutOfFive(scoreOutOfTen: number) {
  const outOfFive = scoreOutOfTen / 2;
  return Number.isInteger(outOfFive) ? String(outOfFive) : outOfFive.toFixed(1);
}
