import { reactive, ref } from "vue";
import type { DispatchIncident } from "../types/incidents";
import type { DispatchLocation, IncidentFormState } from "../types/dashboard";

export function useIncidentForm() {
  const incidentForm = reactive<IncidentFormState>({
    clientName: "",
    clientPhone: "",
    clientLicensePlate: "",
    vehicleIssue: "",
    operatorNote: "",
  });

  const dispatchLocation = reactive<DispatchLocation>({
    lat: null,
    lng: null,
  });

  const selectedAddressLabel = ref("");
  const addressQuery = ref("");

  const manualRoad = ref("");
  const manualKm = ref("");
  const manualDirection = ref("");

  function resetIncidentForm() {
    incidentForm.clientName = "";
    incidentForm.clientPhone = "";
    incidentForm.clientLicensePlate = "";
    incidentForm.vehicleIssue = "";
    incidentForm.operatorNote = "";
  }

  function resetIncidentLocation() {
    dispatchLocation.lat = null;
    dispatchLocation.lng = null;
    selectedAddressLabel.value = "";
    addressQuery.value = "";
    manualRoad.value = "";
    manualKm.value = "";
    manualDirection.value = "";
  }

  function resetAllIncidentInputs() {
    resetIncidentForm();
    resetIncidentLocation();
  }

  function fillFormFromIncident(incident: DispatchIncident) {
    incidentForm.clientName = incident.clientName;
    incidentForm.clientPhone = incident.clientPhone;
    incidentForm.clientLicensePlate = incident.clientLicensePlate;
    incidentForm.vehicleIssue = incident.vehicleIssue;
    incidentForm.operatorNote = incident.operatorNote;

    manualRoad.value = incident.road;
    manualKm.value = incident.km !== null ? incident.km.toFixed(1) : "";
    manualDirection.value = incident.direction;

    dispatchLocation.lat = incident.location.lat;
    dispatchLocation.lng = incident.location.lng;
    selectedAddressLabel.value = incident.location.addressLabel ?? "";
    addressQuery.value = incident.location.addressLabel ?? "";
  }

  function setIncidentLocationFromAddress(point: {
    lat: number;
    lng: number;
    label: string;
  }) {
    dispatchLocation.lat = point.lat;
    dispatchLocation.lng = point.lng;
    selectedAddressLabel.value = point.label;
    addressQuery.value = point.label;
  }

  return {
    incidentForm,
    dispatchLocation,
    selectedAddressLabel,
    addressQuery,
    manualRoad,
    manualKm,
    manualDirection,
    resetIncidentForm,
    resetIncidentLocation,
    resetAllIncidentInputs,
    fillFormFromIncident,
    setIncidentLocationFromAddress,
  };
}
