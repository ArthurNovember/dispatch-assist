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
export type ReverseGeocodingResult = {
  label: string;
  road: string | null;
};

type ReverseGeocodingApi = {
  display_name?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    path?: string;
    cycleway?: string;
  };
};

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodingResult | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
  );

  if (!response.ok) {
    throw new Error("Failed to reverse geocode address");
  }

  const data = (await response.json()) as ReverseGeocodingApi;

  return {
    label: data.display_name ?? "Unknown location",
    road:
      data.address?.road ??
      data.address?.pedestrian ??
      data.address?.footway ??
      data.address?.path ??
      data.address?.cycleway ??
      null,
  };
}
