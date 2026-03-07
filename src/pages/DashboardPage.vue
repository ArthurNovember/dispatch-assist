<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { Vehicle, VehicleWithDistance } from "../types/gps";
import GroupSelector from "../components/GroupSelector.vue";
import { getVehiclesByGroup } from "../services/gpsdozor";
import MapView from "../components/MapView.vue";
import { calculateDistanceKm } from "../utils/distance";
import FilterPanel from "../components/FilterPanel.vue";
import { isVehicleOnline } from "../utils/vehicleStatus";
import VehicleDetail from "../components/VehicleDetail.vue";
import { getVehicleHistory } from "../services/gpsdozor";
import { getLastHoursRange } from "../utils/date";
import type { VehicleHistoryPoint } from "../types/gps";
import { getVehicleTrips } from "../services/gpsdozor";
import type { VehicleTrip } from "../types/gps";
import VehicleTripsTable from "../components/VehicleTripsTable.vue";
import AddressSearch from "../components/AddressSearch.vue";
import { calculateEtaMinutes, formatEta } from "../utils/eta";
import { getRoadRoute } from "../services/routing";
import { detectRoadLocationFromCoordinates } from "../services/roadLocation";
const vehicleRoute = ref<VehicleHistoryPoint[]>([]);
const isLoadingRoute = ref(false);
const routeError = ref("");
const vehicleTrips = ref<VehicleTrip[]>([]);
const isLoadingTrips = ref(false);
const tripsError = ref("");
const selectedVehicleRoadRoute = ref<{ lat: number; lng: number }[]>([]);
const isLoadingRoadRoute = ref(false);
const roadRouteError = ref("");
const roadRouteSummary = ref<{
  distanceMeters: number;
  durationSeconds: number;
} | null>(null);
const detectedRoadLocation = ref<{
  road: string | null;
  km: number | null;
  direction: string | null;
  label: string;
} | null>(null);

const isLoadingRoadLocation = ref(false);
const roadLocationError = ref("");

async function loadRoadLocationFromIncident() {
  if (dispatchLocation.lat === null || dispatchLocation.lng === null) {
    detectedRoadLocation.value = null;
    roadLocationError.value = "";
    return;
  }

  isLoadingRoadLocation.value = true;
  roadLocationError.value = "";

  try {
    const result = await detectRoadLocationFromCoordinates(
      dispatchLocation.lat,
      dispatchLocation.lng,
    );

    detectedRoadLocation.value = result;
  } catch (error) {
    roadLocationError.value =
      error instanceof Error ? error.message : "Failed to detect road location";
    detectedRoadLocation.value = null;
  } finally {
    isLoadingRoadLocation.value = false;
  }
}

async function loadRoadRouteToSelectedVehicle() {
  if (
    !selectedVehicle.value ||
    selectedVehicle.value.lat === null ||
    selectedVehicle.value.lng === null ||
    dispatchLocation.lat === null ||
    dispatchLocation.lng === null
  ) {
    selectedVehicleRoadRoute.value = [];
    roadRouteSummary.value = null;
    return;
  }

  isLoadingRoadRoute.value = true;
  roadRouteError.value = "";

  try {
    const result = await getRoadRoute(
      {
        lat: dispatchLocation.lat,
        lng: dispatchLocation.lng,
      },
      {
        lat: selectedVehicle.value.lat,
        lng: selectedVehicle.value.lng,
      },
    );

    selectedVehicleRoadRoute.value = result.points;
    roadRouteSummary.value = {
      distanceMeters: result.distanceMeters,
      durationSeconds: result.durationSeconds,
    };
  } catch (error) {
    roadRouteError.value =
      error instanceof Error ? error.message : "Failed to load road route";
    selectedVehicleRoadRoute.value = [];
    roadRouteSummary.value = null;
  } finally {
    isLoadingRoadRoute.value = false;
  }
}

function onAddressSelect(point: { lat: number; lng: number; label: string }) {
  dispatchLocation.lat = point.lat;
  dispatchLocation.lng = point.lng;
}

async function loadSelectedVehicleTrips() {
  if (!selectedVehicle.value) return;
  const { from, to } = getLastHoursRange(24);
  isLoadingTrips.value = true;
  tripsError.value = "";
  try {
    vehicleTrips.value = await getVehicleTrips(
      selectedVehicle.value.code,
      from,
      to,
    );
  } catch (error) {
    tripsError.value =
      error instanceof Error ? error.message : "Failed to load trips";
    vehicleTrips.value = [];
  } finally {
    isLoadingTrips.value = false;
  }
}

async function loadSelectedVehicleRoute() {
  if (!selectedVehicle.value) return;
  const { from, to } = getLastHoursRange(6);
  isLoadingRoute.value = true;
  routeError.value = "";
  try {
    vehicleRoute.value = await getVehicleHistory(
      selectedVehicle.value.code,
      from,
      to,
    );
  } catch (error) {
    routeError.value =
      error instanceof Error ? error.message : "Failed to load route";
    vehicleRoute.value = [];
  } finally {
    isLoadingRoute.value = false;
  }
}

const dispatchLocation = reactive({
  lat: null as number | null,
  lng: null as number | null,
});
const selectedGroup = ref<string | null>(null);
const vehicles = ref<Vehicle[]>([]);
const selectedVehicle = ref<Vehicle | null>(null);
const isLoadingVehicles = ref(false);
const vehiclesError = ref("");
function onVehicleSelect(vehicle: Vehicle) {
  selectedVehicle.value = vehicle;
}
const manualDirection = ref("");

const filters = reactive({
  radiusKm: 99999,
  selectedBranch: "",
  onlineOnly: false,
});

const availableBranches = computed(() => {
  const branches = vehicles.value
    .map((vehicle) => vehicle.branchName)
    .filter((branch) => branch.trim() !== "");
  return [...new Set(branches)].sort();
});

const filteredNearestVehicles = computed(() => {
  return nearestVehicles.value.filter((vehicle) => {
    const matchesRadius = vehicle.distanceKm <= filters.radiusKm;
    const matchesBranch =
      !filters.selectedBranch || vehicle.branchName === filters.selectedBranch;
    const matchesOnline =
      !filters.onlineOnly || isVehicleOnline(vehicle.lastPositionTimestamp);
    return matchesRadius && matchesBranch && matchesOnline;
  });
});

const nearestVehicles = computed<VehicleWithDistance[]>(() => {
  if (dispatchLocation.lat === null || dispatchLocation.lng === null) {
    return [];
  }
  return vehicles.value
    .filter((vehicle) => vehicle.lat !== null && vehicle.lng !== null)
    .map((vehicle) => {
      const distanceKm = calculateDistanceKm(
        dispatchLocation.lat!,
        dispatchLocation.lng!,
        vehicle.lat!,
        vehicle.lng!,
      );
      const etaMinutes = calculateEtaMinutes(distanceKm, vehicle.speed);
      return {
        ...vehicle,
        distanceKm,
        etaMinutes,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
});

function onIncidentSelect(point: { lat: number; lng: number }) {
  dispatchLocation.lat = point.lat;
  dispatchLocation.lng = point.lng;
}
async function loadVehicles(groupCode: string) {
  isLoadingVehicles.value = true;
  vehiclesError.value = "";
  try {
    vehicles.value = await getVehiclesByGroup(groupCode);
  } catch (error) {
    vehiclesError.value =
      error instanceof Error ? error.message : "Failed to load vehicles";
    vehicles.value = [];
  } finally {
    isLoadingVehicles.value = false;
  }
}
watch(selectedGroup, (newGroupCode) => {
  selectedVehicle.value = null;
  if (!newGroupCode) {
    vehicles.value = [];
    return;
  }
  loadVehicles(newGroupCode);
});
watch(
  () => [selectedVehicle.value, dispatchLocation.lat, dispatchLocation.lng],
  () => {
    loadRoadRouteToSelectedVehicle();
  },
  { deep: true },
);
watch(
  () => [dispatchLocation.lat, dispatchLocation.lng],
  () => {
    loadRoadLocationFromIncident();
  },
);
</script>

<template>
  <div class="dashboard">
    <section class="top-bar">
      <div class="groupPanel">
        <GroupSelector v-model="selectedGroup" />
      </div>

      <div class="adressPanel">
        <AddressSearch @select-address="onAddressSelect" />
      </div>
      <div class="incidentPanel">
        <div class="panel-header">
          <div>
            <h3>Incident road reference</h3>
            <p>Detected road / highway info for the selected incident point.</p>
          </div>
        </div>

        <p
          v-if="dispatchLocation.lat === null || dispatchLocation.lng === null"
          class="empty-state"
        >
          No incident selected
        </p>

        <p v-else-if="isLoadingRoadLocation">Detecting road location...</p>
        <p v-else-if="roadLocationError">{{ roadLocationError }}</p>

        <div v-else-if="detectedRoadLocation" class="road-meta">
          <div class="road-meta-row">
            <span class="road-meta-label">Road</span>
            <strong>{{ detectedRoadLocation.road || "—" }}</strong>
          </div>

          <div class="road-meta-row">
            <span class="road-meta-label">KM</span>
            <strong>
              {{
                detectedRoadLocation.km !== null
                  ? detectedRoadLocation.km.toFixed(1)
                  : "—"
              }}
            </strong>
          </div>

          <div class="info-row">
            <input
              v-model="manualDirection"
              placeholder="Direction..."
              class="direction-input"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="main-grid">
      <div class="left-column">
        <div class="panel panel-map">
          <div class="panel-header">
            <div>
              <h3>Live Map</h3>
              <p>Click the map or search an address to create an incident.</p>
            </div>
          </div>

          <MapView
            :vehicles="vehicles"
            :incidentPoint="dispatchLocation"
            :routePoints="vehicleRoute"
            :roadRoutePoints="selectedVehicleRoadRoute"
            @select-incident="onIncidentSelect"
          />
        </div>
        <div class="panel">
          <VehicleDetail
            :vehicle="selectedVehicle"
            @show-route="loadSelectedVehicleRoute"
            @show-trips="loadSelectedVehicleTrips"
          />
        </div>

        <div class="panel">
          <VehicleTripsTable
            :trips="vehicleTrips"
            :is-loading="isLoadingTrips"
            :error-message="tripsError"
          />
        </div>
      </div>

      <div class="right-column">
        <div class="filterWrapper">
          <div class="filterPanel">
            <FilterPanel
              :radius-km="filters.radiusKm"
              :selected-branch="filters.selectedBranch"
              :online-only="filters.onlineOnly"
              :available-branches="availableBranches"
              @update:radius-km="filters.radiusKm = $event"
              @update:selected-branch="filters.selectedBranch = $event"
              @update:online-only="filters.onlineOnly = $event"
            />
          </div>
        </div>
        <div class="panel">
          <div class="panel-header">
            <div>
              <h3>Nearest Vehicles</h3>
              <p>Best candidates ranked by distance and ETA.</p>
            </div>
          </div>

          <p v-if="filteredNearestVehicles.length === 0" class="empty-state">
            No matching vehicles found
          </p>

          <ul v-else class="nearest-list">
            <li
              v-for="vehicle in filteredNearestVehicles.slice(0, 10)"
              :key="vehicle.id"
              class="nearest-item"
              @click="onVehicleSelect(vehicle)"
            >
              <div class="nearest-main">
                <strong>{{ vehicle.name }}</strong>
                <span class="badge">{{
                  vehicle.branchName || "No branch"
                }}</span>
              </div>

              <div class="nearest-meta">
                <span>{{ vehicle.distanceKm.toFixed(2) }} km</span>
                <span>ETA: {{ formatEta(vehicle.etaMinutes) }}</span>
                <span>{{ vehicle.speed }} km/h</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-bar {
  display: flex;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  align-items: center;
  background-color: white;
  padding: 1vw;
  border-radius: 14px;
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(360px, 420px);
  gap: 20px;
  align-items: start;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
  height: 100%;
}

.panel-map {
  padding: 18px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-header h3 {
  margin: 0 0 4px;
  font-size: 18px;
}

.panel-header p {
  margin: 0;
  color: var(--text-soft);
  font-size: 14px;
}

.empty-state {
  margin: 0;
  color: var(--text-soft);
}

.nearest-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nearest-item {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  background: var(--panel-soft);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.nearest-item:hover {
  transform: translateY(-2px);
  border-color: #bfdbfe;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
}

.nearest-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.nearest-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: var(--text-soft);
  font-size: 14px;
}

.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 10px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 600;
}

:deep(button) {
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  background: var(--accent);
  color: white;
  cursor: pointer;
  transition: background 0.18s ease;
}

:deep(button:hover) {
  background: var(--accent-hover);
}

:deep(input),
:deep(select) {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  background: white;
  color: var(--text);
}

:deep(h3) {
  color: var(--text);
}

@media (max-width: 1180px) {
  .top-bar {
    grid-template-columns: 1fr;
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .right-column {
    order: 2;
  }

  .left-column {
    order: 1;
  }
}

.road-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.road-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--panel-soft);
  border: 1px solid var(--border);
}

.road-meta-label {
  color: var(--text-soft);
  font-size: 14px;
}

.direction-input {
  width: 100%;
}

.filterPanel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
  height: 100%;
}

.filterWrapper {
  width: 100%;
}

.groupPanel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
  height: 15vw;
  width: 40%;
}

.adressPanel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
  height: 15vw;
  width: 100%;
}

.incidentPanel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  box-shadow: var(--shadow);
  height: 15vw;
  width: 40%;
}
</style>
