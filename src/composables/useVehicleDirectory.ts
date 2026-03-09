import { computed, reactive, ref, watch } from "vue";
import type { Vehicle, VehicleWithDistance } from "../types/gps";
import { getVehiclesByGroup } from "../services/gpsdozor";
import { calculateDistanceKm } from "../utils/distance";
import { calculateEtaMinutes } from "../utils/eta";
import { isVehicleOnline } from "../utils/vehicleStatus";
import type { DispatchLocation } from "../types/dashboard";

type UseVehicleDirectoryParams = {
  dispatchLocation: DispatchLocation;
  selectedVehicle: { value: Vehicle | null };
};

export function useVehicleDirectory({
  dispatchLocation,
  selectedVehicle,
}: UseVehicleDirectoryParams) {
  const selectedGroup = ref<string | null>(null);
  const vehicles = ref<Vehicle[]>([]);
  const isLoadingVehicles = ref(false);
  const vehiclesError = ref("");

  const filters = reactive({
    radiusKm: 99999,
    selectedBranch: "",
    onlineOnly: false,
  });

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

  const availableBranches = computed(() => {
    const branches = vehicles.value
      .map((vehicle) => vehicle.branchName)
      .filter((branch) => branch.trim() !== "");

    return [...new Set(branches)].sort();
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

  const filteredNearestVehicles = computed(() => {
    return nearestVehicles.value.filter((vehicle) => {
      const matchesRadius = vehicle.distanceKm <= filters.radiusKm;
      const matchesBranch =
        !filters.selectedBranch ||
        vehicle.branchName === filters.selectedBranch;
      const matchesOnline =
        !filters.onlineOnly || isVehicleOnline(vehicle.lastPositionTimestamp);

      return matchesRadius && matchesBranch && matchesOnline;
    });
  });

  watch(selectedGroup, (newGroupCode) => {
    selectedVehicle.value = null;

    if (!newGroupCode) {
      vehicles.value = [];
      return;
    }

    loadVehicles(newGroupCode);
  });

  return {
    selectedGroup,
    vehicles,
    isLoadingVehicles,
    vehiclesError,
    filters,
    availableBranches,
    nearestVehicles,
    filteredNearestVehicles,
    loadVehicles,
  };
}
