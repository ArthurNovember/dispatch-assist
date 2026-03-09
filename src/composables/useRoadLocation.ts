import { ref } from "vue";
import { reverseGeocode } from "../services/geocoding";
import {
  detectRoadLocationFromCoordinates,
  resolveRoadLocationToCoordinates,
} from "../services/roadLocation";
import type { DispatchLocation } from "../types/dashboard";

type UseRoadLocationParams = {
  dispatchLocation: DispatchLocation;
  manualRoad: { value: string };
  manualKm: { value: string };
  manualDirection: { value: string };
  addressQuery: { value: string };
};

export function useRoadLocation({
  dispatchLocation,
  manualRoad,
  manualKm,
  manualDirection,
  addressQuery,
}: UseRoadLocationParams) {
  const detectedRoadLocation = ref<{
    road: string | null;
    km: number | null;
    direction: string | null;
    label: string;
  } | null>(null);

  const isLoadingRoadLocation = ref(false);
  const roadLocationError = ref("");

  const roadResolveError = ref("");
  const isResolvingRoadLocation = ref(false);

  function isHighwayRoad(road: string | null): boolean {
    return typeof road === "string" && /^D\d+$/i.test(road.trim());
  }

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

      if (isHighwayRoad(result.road)) {
        manualRoad.value = result.road ?? "";
        manualKm.value = result.km !== null ? result.km.toFixed(1) : "";
        manualDirection.value = "";
        return;
      }

      const fallback = await reverseGeocode(
        dispatchLocation.lat,
        dispatchLocation.lng,
      );

      detectedRoadLocation.value = {
        road: fallback?.road ?? null,
        km: null,
        direction: null,
        label: fallback?.label ?? "Unknown location",
      };

      manualRoad.value = "";
      manualKm.value = "";
      manualDirection.value = "";
    } catch (error) {
      roadLocationError.value =
        error instanceof Error
          ? error.message
          : "Failed to detect road location";
      detectedRoadLocation.value = null;
    } finally {
      isLoadingRoadLocation.value = false;
    }
  }

  async function applyRoadLocationToMap() {
    roadResolveError.value = "";

    const road = manualRoad.value.trim().toUpperCase();
    const km = Number(manualKm.value.replace(",", "."));

    if (!road) {
      roadResolveError.value = "Enter a road";
      return;
    }

    if (!Number.isFinite(km)) {
      roadResolveError.value = "Enter a valid KM";
      return;
    }

    isResolvingRoadLocation.value = true;

    try {
      const result = await resolveRoadLocationToCoordinates(road, km);

      if (!result) {
        roadResolveError.value = "No matching road location found";
        return;
      }

      dispatchLocation.lat = result.lat;
      dispatchLocation.lng = result.lng;

      manualRoad.value = result.road ?? road;
      manualKm.value =
        result.km !== null ? result.km.toFixed(1) : manualKm.value;
      manualDirection.value = "";
      addressQuery.value =
        result.km !== null
          ? `${result.road} km ${result.km.toFixed(1)}`
          : (result.road ?? "");
    } catch (error) {
      roadResolveError.value =
        error instanceof Error
          ? error.message
          : "Failed to resolve road location";
    } finally {
      isResolvingRoadLocation.value = false;
    }
  }

  return {
    detectedRoadLocation,
    isLoadingRoadLocation,
    roadLocationError,
    roadResolveError,
    isResolvingRoadLocation,
    loadRoadLocationFromIncident,
    applyRoadLocationToMap,
    isHighwayRoad,
  };
}
