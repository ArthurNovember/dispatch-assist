export type RoutePoint = {
  lat: number;
  lng: number;
};

export type RoadRoute = {
  points: RoutePoint[];
  distanceMeters: number;
  durationSeconds: number;
};

type OsrmRouteResponse = {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
      type: "LineString";
    };
  }>;
};

export async function getRoadRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<RoadRoute> {
  const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;

  const url =
    `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
    `?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Routing request failed with status ${response.status}`);
  }

  const data = (await response.json()) as OsrmRouteResponse;

  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new Error("No route found");
  }
  const route = data.routes[0]!;

  return {
    points: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  };
}
