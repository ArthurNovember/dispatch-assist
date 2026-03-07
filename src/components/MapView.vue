<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Vehicle, VehicleHistoryPoint } from "../types/gps";

let roadRouteLine: L.Polyline | null = null;

function renderRoadRouteLine() {
  if (!map) return;

  if (roadRouteLine) {
    roadRouteLine.remove();
    roadRouteLine = null;
  }

  if (!props.roadRoutePoints || props.roadRoutePoints.length === 0) {
    return;
  }

  const latLngs = props.roadRoutePoints.map(
    (point) => [point.lat, point.lng] as [number, number],
  );

  roadRouteLine = L.polyline(latLngs, {
    weight: 5,
  }).addTo(map);

  map.fitBounds(roadRouteLine.getBounds(), { padding: [30, 30] });
}

const carIcon = L.icon({
  iconUrl: "/icons/car.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const props = defineProps<{
  vehicles: Vehicle[];
  incidentPoint: { lat: number | null; lng: number | null };
  routePoints?: VehicleHistoryPoint[];

  roadRoutePoints?: { lat: number; lng: number }[];
}>();

const emit = defineEmits<{
  (e: "select-incident", point: { lat: number; lng: number }): void;
}>();

const mapElement = ref<HTMLElement | null>(null);

let map: L.Map | null = null;
let vehicleMarkersLayer: L.LayerGroup | null = null;
let incidentMarker: L.Marker | null = null;
let routeLine: L.Polyline | null = null;

function renderVehicleMarkers() {
  if (!vehicleMarkersLayer) return;

  const layer = vehicleMarkersLayer;

  layer.clearLayers();

  props.vehicles.forEach((vehicle) => {
    if (vehicle.lat === null || vehicle.lng === null) return;

    L.marker([vehicle.lat, vehicle.lng], { icon: carIcon }).addTo(layer)
      .bindPopup(`
        <strong>${vehicle.name}</strong><br />
        SPZ: ${vehicle.spz || "—"}<br />
        Speed: ${vehicle.speed} km/h
      `);
  });
}

function renderIncidentMarker() {
  if (!map) return;

  if (incidentMarker) {
    incidentMarker.remove();
    incidentMarker = null;
  }

  if (props.incidentPoint.lat === null || props.incidentPoint.lng === null) {
    return;
  }

  incidentMarker = L.marker(
    [props.incidentPoint.lat, props.incidentPoint.lng],
    {
      title: "Incident point",
    },
  )
    .addTo(map)
    .bindPopup("Incident point");
}

function renderRouteLine() {
  if (!map) return;

  if (routeLine) {
    routeLine.remove();
    routeLine = null;
  }

  if (!props.routePoints || props.routePoints.length === 0) return;

  const latLngs = props.routePoints.map(
    (point) => [point.lat, point.lng] as [number, number],
  );

  routeLine = L.polyline(latLngs).addTo(map);
  map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
}

onMounted(() => {
  if (!mapElement.value) return;

  map = L.map(mapElement.value).setView([49.8, 15.5], 7);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  vehicleMarkersLayer = L.layerGroup().addTo(map);

  map.on("click", (event: L.LeafletMouseEvent) => {
    emit("select-incident", {
      lat: event.latlng.lat,
      lng: event.latlng.lng,
    });
  });

  renderVehicleMarkers();
  renderIncidentMarker();
  renderRouteLine();
  renderRoadRouteLine();
});

watch(
  () => props.vehicles,
  () => {
    renderVehicleMarkers();
  },
  { deep: true },
);

watch(
  () => props.incidentPoint,
  () => {
    renderIncidentMarker();
  },
  { deep: true },
);

watch(
  () => props.routePoints,
  () => {
    renderRouteLine();
  },
  { deep: true },
);

watch(
  () => props.roadRoutePoints,
  () => {
    renderRoadRouteLine();
  },
  { deep: true },
);

onUnmounted(() => {
  roadRouteLine?.remove();

  routeLine?.remove();
  incidentMarker?.remove();
  map?.remove();

  roadRouteLine = null;

  routeLine = null;
  incidentMarker = null;
  vehicleMarkersLayer = null;
  map = null;
});
</script>

<template>
  <div ref="mapElement" class="map"></div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 620px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
}
</style>
