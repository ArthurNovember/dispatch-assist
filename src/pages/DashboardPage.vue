<script setup lang="ts">
import { watch } from "vue";
import type { VehicleWithDistance } from "../types/gps";

import GroupSelector from "../components/GroupSelector.vue";
import MapView from "../components/MapView.vue";
import FilterPanel from "../components/FilterPanel.vue";
import VehicleDetail from "../components/VehicleDetail.vue";
import VehicleTripsTable from "../components/VehicleTripsTable.vue";
import AddressSearch from "../components/AddressSearch.vue";

import IncidentsDrawer from "../components/dashboard/IncidentsDrawer.vue";
import ClientInfoPanel from "../components/dashboard/ClientInfoPanel.vue";
import IncidentRoadReferencePanel from "../components/dashboard/IncidentRoadReferencePanel.vue";
import NearestVehiclesPanel from "../components/dashboard/NearestVehiclesPanel.vue";
import CreateIncidentActions from "../components/dashboard/CreateIncidentActions.vue";

import { reverseGeocode } from "../services/geocoding";
import { useIncidentForm } from "../composables/useIncidentForm";
import { useRoadLocation } from "../composables/useRoadLocation";
import { useVehicleSelection } from "../composables/useVehicleSelection";
import { useVehicleDirectory } from "../composables/useVehicleDirectory";
import { useIncidents } from "../composables/useIncidents";

const props = defineProps<{
  openIncidentsSignal: number;
}>();

const {
  incidentForm,
  dispatchLocation,
  selectedAddressLabel,
  addressQuery,
  manualRoad,
  manualKm,
  manualDirection,
  resetIncidentForm,
  resetIncidentLocation,
  fillFormFromIncident,
  setIncidentLocationFromAddress,
} = useIncidentForm();

const {
  selectedVehicle,
  vehicleRoute,

  vehicleTrips,
  isLoadingTrips,
  tripsError,
  selectedVehicleRoadRoute,

  onVehicleSelect,
  loadSelectedVehicleRoute,
  loadSelectedVehicleTrips,
  loadRoadRouteToSelectedVehicle,
} = useVehicleSelection(dispatchLocation);

const {
  selectedGroup,
  vehicles,

  filters,
  availableBranches,
  filteredNearestVehicles,
} = useVehicleDirectory({
  dispatchLocation,
  selectedVehicle,
});

const {
  isLoadingRoadLocation,
  roadLocationError,
  roadResolveError,
  isResolvingRoadLocation,
  loadRoadLocationFromIncident,
  applyRoadLocationToMap,
} = useRoadLocation({
  dispatchLocation,
  manualRoad,
  manualKm,
  manualDirection,
  addressQuery,
});

const {
  incidentSearch,
  createIncidentError,
  selectedIncidentId,
  isMenuOpen,
  filteredIncidents,
  closeMenu,
  createIncident,
  openIncident,
  startNewIncident,
} = useIncidents({
  incidentForm,
  dispatchLocation,
  addressQuery,
  manualRoad,
  manualKm,
  manualDirection,
  selectedVehicle,
  vehicles,
  resetIncidentForm,
  resetIncidentLocation,
});

function handleOpenIncident(incidentId: string) {
  openIncident(incidentId, fillFormFromIncident);
}

function handleAddressSelect(point: {
  lat: number;
  lng: number;
  label: string;
}) {
  setIncidentLocationFromAddress(point);
}

async function onIncidentSelect(point: { lat: number; lng: number }) {
  dispatchLocation.lat = point.lat;
  dispatchLocation.lng = point.lng;

  addressQuery.value = "";
  selectedAddressLabel.value = "";

  try {
    const result = await reverseGeocode(point.lat, point.lng);

    if (result?.label) {
      addressQuery.value = result.label;
      selectedAddressLabel.value = result.label;
    }
  } catch (error) {
    console.error("Reverse geocoding failed", error);
  }
}

function handleVehicleSelect(vehicle: VehicleWithDistance) {
  onVehicleSelect(vehicle);
}

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

watch(
  () => props.openIncidentsSignal,
  () => {
    isMenuOpen.value = true;
  },
);
</script>

<template>
  <IncidentsDrawer
    :is-open="isMenuOpen"
    :incident-search="incidentSearch"
    :incidents="filteredIncidents"
    @close="closeMenu"
    @new-incident="startNewIncident"
    @open-incident="handleOpenIncident"
    @update:incident-search="incidentSearch = $event"
  />

  <div class="dashboard">
    <div class="groupPanel">
      <GroupSelector v-model="selectedGroup" />
    </div>

    <ClientInfoPanel
      :client-name="incidentForm.clientName"
      :client-phone="incidentForm.clientPhone"
      :client-license-plate="incidentForm.clientLicensePlate"
      :vehicle-issue="incidentForm.vehicleIssue"
      :operator-note="incidentForm.operatorNote"
      @update:client-name="incidentForm.clientName = $event"
      @update:client-phone="incidentForm.clientPhone = $event"
      @update:client-license-plate="incidentForm.clientLicensePlate = $event"
      @update:vehicle-issue="incidentForm.vehicleIssue = $event"
      @update:operator-note="incidentForm.operatorNote = $event"
    />

    <section class="top-bar">
      <div class="adressPanel">
        <AddressSearch
          v-model="addressQuery"
          @select-address="handleAddressSelect"
        />
      </div>

      <div class="panel">
        <IncidentRoadReferencePanel
          :dispatch-lat="dispatchLocation.lat"
          :dispatch-lng="dispatchLocation.lng"
          :is-loading-road-location="isLoadingRoadLocation"
          :road-location-error="roadLocationError"
          :manual-road="manualRoad"
          :manual-km="manualKm"
          :manual-direction="manualDirection"
          :road-resolve-error="roadResolveError"
          :is-resolving-road-location="isResolvingRoadLocation"
          @update:manual-road="manualRoad = $event"
          @update:manual-km="manualKm = $event"
          @update:manual-direction="manualDirection = $event"
          @apply-road-location="applyRoadLocationToMap"
        />
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

        <NearestVehiclesPanel
          :vehicles="filteredNearestVehicles"
          :selected-vehicle-id="selectedVehicle ? selectedVehicle.id : null"
          @select-vehicle="handleVehicleSelect"
        />
      </div>
    </section>

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

    <CreateIncidentActions
      v-if="selectedIncidentId === null"
      :error-message="createIncidentError"
      @create-incident="createIncident"
    />
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
  gap: 20px;
  align-items: stretch;
  background-color: white;
  padding: 14px;
  border-radius: 14px;
}

.adressPanel {
  flex: 1;
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(360px, 420px);
  gap: 20px;
  background-color: white;
  align-items: start;
  border-radius: 14px;
  padding: 10px;
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
  margin: 0;
}

.panel-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.filterWrapper,
.filterPanel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 1100px) {
  .top-bar {
    flex-direction: column;
  }

  .main-grid {
    grid-template-columns: 1fr;
  }
}
</style>
