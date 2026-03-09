import { computed, ref } from "vue";
import type { Vehicle } from "../types/gps";
import type { DispatchIncident } from "../types/incidents";
import type { DispatchLocation, IncidentFormState } from "../types/dashboard";

type UseIncidentsParams = {
  incidentForm: IncidentFormState;
  dispatchLocation: DispatchLocation;
  addressQuery: { value: string };
  manualRoad: { value: string };
  manualKm: { value: string };
  manualDirection: { value: string };
  selectedVehicle: { value: Vehicle | null };
  vehicles: { value: Vehicle[] };
  resetIncidentForm: () => void;
  resetIncidentLocation: () => void;
};

export function useIncidents({
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
}: UseIncidentsParams) {
  const incidents = ref<DispatchIncident[]>([]);
  const incidentSearch = ref("");
  const createIncidentError = ref("");

  const selectedIncidentId = ref<string | null>(null);
  const isMenuOpen = ref(false);

  const isEditingIncident = computed(() => selectedIncidentId.value !== null);

  function closeMenu() {
    isMenuOpen.value = false;
  }

  function generateIncidentId(): string {
    const year = new Date().getFullYear();
    const nextNumber = incidents.value.length + 1;
    return `DA-${year}-${String(nextNumber).padStart(4, "0")}`;
  }

  const filteredIncidents = computed(() => {
    const query = incidentSearch.value.trim().toLowerCase();

    if (!query) {
      return incidents.value;
    }

    return incidents.value.filter((incident) =>
      incident.id.toLowerCase().includes(query),
    );
  });

  function validateIncidentForm(): { km: number | null } | null {
    createIncidentError.value = "";

    if (!incidentForm.clientName.trim()) {
      createIncidentError.value = "Enter client name";
      return null;
    }

    if (!incidentForm.clientPhone.trim()) {
      createIncidentError.value = "Enter client phone";
      return null;
    }

    if (dispatchLocation.lat === null || dispatchLocation.lng === null) {
      createIncidentError.value = "Select incident location on map";
      return null;
    }

    const kmValue = manualKm.value.trim();
    const km = kmValue === "" ? null : Number(kmValue.replace(",", "."));

    if (kmValue !== "" && !Number.isFinite(km)) {
      createIncidentError.value = "Enter valid KM";
      return null;
    }

    return { km };
  }

  function buildAssignedVehicle() {
    return selectedVehicle.value
      ? {
          id: String(selectedVehicle.value.id),
          name: selectedVehicle.value.name,
          spz: selectedVehicle.value.spz ?? "",
        }
      : null;
  }

  function createIncident() {
    const validated = validateIncidentForm();
    if (!validated) return;

    const incident: DispatchIncident = {
      id: generateIncidentId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: selectedVehicle.value ? "assigned" : "new",

      clientName: incidentForm.clientName.trim(),
      clientPhone: incidentForm.clientPhone.trim(),
      clientLicensePlate: incidentForm.clientLicensePlate.trim(),
      vehicleIssue: incidentForm.vehicleIssue.trim(),
      operatorNote: incidentForm.operatorNote.trim(),

      road: manualRoad.value.trim() || "Unknown road",
      km: validated.km,
      direction: manualDirection.value.trim(),

      location: {
        lat: dispatchLocation.lat,
        lng: dispatchLocation.lng,
        addressLabel: addressQuery.value,
      },

      assignedVehicle: buildAssignedVehicle(),
    };

    incidents.value.unshift(incident);

    resetIncidentForm();
    resetIncidentLocation();
    selectedVehicle.value = null;

    selectedIncidentId.value = incident.id;
    isMenuOpen.value = true;
  }

  function updateIncident() {
    if (!selectedIncidentId.value) {
      createIncidentError.value = "No incident selected for editing";
      return;
    }

    const validated = validateIncidentForm();
    if (!validated) return;

    const incidentIndex = incidents.value.findIndex(
      (incident) => incident.id === selectedIncidentId.value,
    );

    if (incidentIndex === -1) {
      createIncidentError.value = "Selected incident was not found";
      return;
    }

    const existingIncident = incidents.value[incidentIndex]!;
    incidents.value[incidentIndex] = {
      ...existingIncident,
      updatedAt: new Date().toISOString(),
      status: selectedVehicle.value ? "assigned" : "new",

      clientName: incidentForm.clientName.trim(),
      clientPhone: incidentForm.clientPhone.trim(),
      clientLicensePlate: incidentForm.clientLicensePlate.trim(),
      vehicleIssue: incidentForm.vehicleIssue.trim(),
      operatorNote: incidentForm.operatorNote.trim(),

      road: manualRoad.value.trim() || "Unknown road",
      km: validated.km,
      direction: manualDirection.value.trim(),

      location: {
        lat: dispatchLocation.lat,
        lng: dispatchLocation.lng,
        addressLabel: addressQuery.value,
      },

      assignedVehicle: buildAssignedVehicle(),
    };

    createIncidentError.value = "";
  }

  function openIncident(
    incidentId: string,
    fillFormFromIncident: (incident: DispatchIncident) => void,
  ) {
    const incident = incidents.value.find((item) => item.id === incidentId);
    if (!incident) return;

    selectedIncidentId.value = incident.id;

    if (incident.assignedVehicle) {
      selectedVehicle.value =
        vehicles.value.find(
          (vehicle) => String(vehicle.id) === incident.assignedVehicle?.id,
        ) ?? null;
    } else {
      selectedVehicle.value = null;
    }

    fillFormFromIncident(incident);
    closeMenu();
  }

  function startNewIncident() {
    selectedIncidentId.value = null;
    createIncidentError.value = "";
    resetIncidentForm();
    resetIncidentLocation();
    selectedVehicle.value = null;
    closeMenu();
  }

  return {
    incidents,
    incidentSearch,
    createIncidentError,
    selectedIncidentId,
    isEditingIncident,
    isMenuOpen,
    filteredIncidents,
    closeMenu,
    createIncident,
    updateIncident,
    openIncident,
    startNewIncident,
  };
}
