export type IncidentStatus =
  | "new"
  | "assigned"
  | "in_progress"
  | "done"
  | "cancelled";

export type IncidentVehicleAssignment = {
  id: string;
  name: string;
  spz: string;
} | null;

export type DispatchIncident = {
  id: string;
  createdAt: string;
  updatedAt: string;

  status: IncidentStatus;

  clientName: string;
  clientPhone: string;
  clientLicensePlate: string;
  vehicleIssue: string;
  operatorNote: string;

  road: string;
  km: number | null;
  direction: string;

  location: {
    lat: number | null;
    lng: number | null;
    addressLabel: string;
  };

  assignedVehicle: IncidentVehicleAssignment;
};
