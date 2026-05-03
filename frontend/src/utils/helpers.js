export function stockRatio(current, threshold) {
  return Math.min((current / threshold) * 100, 100);
}
