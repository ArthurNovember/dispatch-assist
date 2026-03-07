export function getMinutesSince(timestamp: string | null): number | null {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  const time = date.getTime();
  if (Number.isNaN(time)) return null;
  const now = Date.now();
  return (now - time) / 1000 / 60;
}
export function isVehicleOnline(
  lastPositionTimestamp: string | null,
  maxMinutes = 10,
): boolean {
  const minutes = getMinutesSince(lastPositionTimestamp);
  if (minutes === null) return false;
  return minutes <= maxMinutes;
}
