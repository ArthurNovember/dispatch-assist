export function calculateEtaMinutes(
  distanceKm: number,
  speedKmH: number,
  fallbackSpeedKmH = 50,
): number {
  const effectiveSpeed = speedKmH > 0 ? speedKmH : fallbackSpeedKmH;
  const hours = distanceKm / effectiveSpeed;
  return hours * 60;
}
export function formatEta(minutes: number): string {
  if (minutes < 1) {
    return "< 1 min";
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return `${hours} h ${remainingMinutes} min`;
}
