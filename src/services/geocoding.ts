import type { GeocodingResult, GeocodingResultApi } from "../types/gps";
function mapGeocodingResult(item: GeocodingResultApi): GeocodingResult {
  return {
    lat: Number(item.lat),
    lng: Number(item.lon),
    label: item.display_name,
  };
}
export async function searchAddress(query: string): Promise<GeocodingResult[]> {
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5`,
  );
  if (!response.ok) {
    throw new Error("Failed to search address");
  }
  const data = (await response.json()) as GeocodingResultApi[];
  return data.map(mapGeocodingResult);
}
