import { ref } from "vue";
import type { Vehicle, VehicleHistoryPoint, VehicleTrip } from "../types/gps";
import { getVehicleHistory, getVehicleTrips } from "../services/gpsdozor";
import { getRoadRoute } from "../services/routing";
import { getLastHoursRange } from "../utils/date";
import type { DispatchLocation } from "../types/dashboard";

export function useVehicleSelection(dispatchLocation: DispatchLocation) {
  const selectedVehicle = ref<Vehicle | null>(null);

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

  function onVehicleSelect(vehicle: Vehicle) {
    selectedVehicle.value = vehicle;
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

  function clearSelectedVehicle() {
    selectedVehicle.value = null;
    vehicleRoute.value = [];
    vehicleTrips.value = [];
    selectedVehicleRoadRoute.value = [];
    roadRouteSummary.value = null;
    routeError.value = "";
    tripsError.value = "";
    roadRouteError.value = "";
  }

  return {
    selectedVehicle,
    vehicleRoute,
    isLoadingRoute,
    routeError,
    vehicleTrips,
    isLoadingTrips,
    tripsError,
    selectedVehicleRoadRoute,
    isLoadingRoadRoute,
    roadRouteError,
    roadRouteSummary,
    onVehicleSelect,
    loadSelectedVehicleRoute,
    loadSelectedVehicleTrips,
    loadRoadRouteToSelectedVehicle,
    clearSelectedVehicle,
  };
}
