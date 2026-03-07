export function toApiDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
export function getLastHoursRange(hours: number) {
  const to = new Date();
  const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
  return {
    from: toApiDateTime(from),
    to: toApiDateTime(to),
  };
}
