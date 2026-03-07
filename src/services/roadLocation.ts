export type DetectedRoadLocation = {
  road: string | null;
  km: number | null;
  direction: string | null;
  label: string;
};

type ArcGisFeature = {
  attributes?: Record<string, unknown>;
  geometry?: {
    x?: number;
    y?: number;
  };
};

type ArcGisQueryResponse = {
  features?: ArcGisFeature[];
};

export type ResolvedRoadPoint = {
  road: string | null;
  km: number | null;
  lat: number;
  lng: number;
};

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function buildRoadKmQueryUrl(
  road: string,
  km: number,
  kmField: string,
): string {
  const minKm = km - 2;
  const maxKm = km + 2;

  const params = new URLSearchParams({
    f: "json",
    where:
      `SILNICE LIKE '${escapeSqlString(road)}%' ` +
      `AND ${kmField} >= ${minKm} AND ${kmField} <= ${maxKm}`,
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
  });

  return `${RSD_BASE}/${HIGHWAY_MARKERS_LAYER_ID}/query?${params.toString()}`;
}

async function queryRoadKmFeatures(
  road: string,
  km: number,
): Promise<ArcGisFeature[]> {
  const urls = [
    buildRoadKmQueryUrl(road, km, "HODN_KM"),
    buildRoadKmQueryUrl(road, km, "HODN_KMK"),
  ];

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`RSD request failed with status ${response.status}`);
      }

      const data = (await response.json()) as ArcGisQueryResponse;
      return data.features ?? [];
    }),
  );

  return results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
}

export async function resolveRoadLocationToCoordinates(
  road: string,
  km: number,
): Promise<ResolvedRoadPoint | null> {
  const features = await queryRoadKmFeatures(road, km);

  if (features.length === 0) {
    return null;
  }

  let bestFeature: ArcGisFeature | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  for (const feature of features) {
    const attrs = normalizeAttributeKeys(feature.attributes);
    const featureRoad = extractRoad(attrs);
    const featureKm = extractKm(attrs);

    if (!featureRoad || featureKm === null) continue;
    if (featureRoad !== road) continue;

    const diff = Math.abs(featureKm - km);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestFeature = feature;
    }
  }

  if (!bestFeature) {
    return null;
  }

  const attrs = normalizeAttributeKeys(bestFeature.attributes);
  const point = getPoint(bestFeature);
  const resolvedRoad = extractRoad(attrs);
  const resolvedKm = extractKm(attrs);

  if (!point || !resolvedRoad || resolvedKm === null) {
    return null;
  }

  return {
    road: resolvedRoad,
    km: resolvedKm,
    lat: point.lat,
    lng: point.lng,
  };
}

const RSD_BASE =
  "https://geoportal.rsd.cz/arcgis/rest/services/PrezentaceULS/MapServer";

// podle veřejného katalogu je layer 0 vrstva Km
const HIGHWAY_MARKERS_LAYER_ID = 1;

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", ".").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function pickString(
  attrs: Record<string, unknown> | undefined,
  keys: string[],
): string | null {
  if (!attrs) return null;

  for (const key of keys) {
    const value = attrs[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function pickNumber(
  attrs: Record<string, unknown> | undefined,
  keys: string[],
): number | null {
  if (!attrs) return null;

  for (const key of keys) {
    const value = toNumber(attrs[key]);
    if (value !== null) return value;
  }

  return null;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildKmQueryUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    f: "json",
    geometry: JSON.stringify({
      x: lng,
      y: lat,
      spatialReference: { wkid: 4326 },
    }),
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    distance: "250",
    units: "esriSRUnit_Meter",
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
  });

  return `${RSD_BASE}/${HIGHWAY_MARKERS_LAYER_ID}/query?${params.toString()}`;
}

async function queryNearbyKmFeatures(
  lat: number,
  lng: number,
): Promise<ArcGisFeature[]> {
  const response = await fetch(buildKmQueryUrl(lat, lng));

  if (!response.ok) {
    throw new Error(`RSD request failed with status ${response.status}`);
  }

  const data = (await response.json()) as ArcGisQueryResponse;
  return data.features ?? [];
}

function getPoint(feature: ArcGisFeature): { lat: number; lng: number } | null {
  if (
    typeof feature.geometry?.x === "number" &&
    typeof feature.geometry?.y === "number"
  ) {
    return {
      lat: feature.geometry.y,
      lng: feature.geometry.x,
    };
  }

  return null;
}

function chooseNearestFeature(
  features: ArcGisFeature[],
  lat: number,
  lng: number,
): ArcGisFeature | null {
  let nearest: ArcGisFeature | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const feature of features) {
    const point = getPoint(feature);
    if (!point) continue;

    const distance = haversineKm(lat, lng, point.lat, point.lng);

    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = feature;
    }
  }

  return nearest;
}

function extractRoad(
  attrs: Record<string, unknown> | undefined,
): string | null {
  const raw = pickString(attrs, ["SILNICE"]);
  if (!raw) return null;

  const match = raw.match(
    /\bD\d+\b|\bR\d+\b|\bI\/\d+\b|\bII\/\d+\b|\bIII\/\d+\b/,
  );
  return match ? match[0] : raw.trim();
}

function extractKm(attrs: Record<string, unknown> | undefined): number | null {
  if (!attrs) return null;

  const key = Object.keys(attrs).find((k) => {
    const normalized = k.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
    return normalized === "HODN_KM" || normalized === "HODN_KMK";
  });

  if (!key) return null;

  const raw = attrs[key];

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const parsed = Number(raw.replace(",", ".").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function extractDirection(
  attrs: Record<string, unknown> | undefined,
): string | null {
  return pickString(attrs, ["UMISTENI"]);
}

function normalizeAttributeKeys(
  attrs: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!attrs) return attrs;

  return Object.fromEntries(
    Object.entries(attrs).map(([key, value]) => [
      key.replace(/[\u200B-\u200D\uFEFF]/g, "").trim(),
      value,
    ]),
  );
}

function normalizeDirection(value: string | null): string | null {
  if (!value) return null;
  if (value === "P") return "right direction";
  if (value === "L") return "left direction";
  return value;
}

export async function detectRoadLocationFromCoordinates(
  lat: number,
  lng: number,
): Promise<DetectedRoadLocation> {
  const features = await queryNearbyKmFeatures(lat, lng);
  const nearestFeature = chooseNearestFeature(features, lat, lng);
  const rawAttrs = nearestFeature?.attributes;
  const attrs = normalizeAttributeKeys(rawAttrs);

  console.log("RSD features", features);
  console.log("RSD nearest attrs", nearestFeature?.attributes);

  const road = extractRoad(attrs);
  const km = extractKm(attrs);
  const direction = normalizeDirection(extractDirection(attrs));

  console.log("parsed road", road);
  console.log("parsed km", km);
  console.log("parsed direction", direction);

  if (!road && km === null) {
    return {
      road: null,
      km: null,
      direction: null,
      label: "Road location not detected",
    };
  }

  const kmLabel = km !== null ? `km ${km.toFixed(1)}` : "km unknown";
  const directionLabel = direction ? `, ${direction}` : "";

  return {
    road,
    km,
    direction,
    label: `${road ?? "Road"} ${kmLabel}${directionLabel}`,
  };
}
