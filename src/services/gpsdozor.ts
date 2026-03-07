import { apiRequest } from "./api";
import type { VehicleTripApi, VehicleTrip } from "../types/gps";
import type { Group, GroupApi, Vehicle, VehicleApi } from "../types/gps";

function mapGroup(apiGroup: GroupApi): Group {
  return {
    code: apiGroup.Code,
    name: apiGroup.Name,
  };
}
export async function getGroups(): Promise<Group[]> {
  const data = await apiRequest<GroupApi[]>("/groups");
  return data.map(mapGroup);
}

function mapVehicleTrip(apiTrip: VehicleTripApi): VehicleTrip {
  return {
    averageSpeed: apiTrip.AverageSpeed,
    maxSpeed: apiTrip.MaxSpeed,
    startTime: apiTrip.StartTime,
    finishTime: apiTrip.FinishTime,
    tripLength: apiTrip.TripLength,
    tripWaitingTime: apiTrip.TripWaitingTime ?? "",
    totalDistance: apiTrip.TotalDistance,
    purpose: apiTrip.Purpose ?? "",
    driverName: apiTrip.DriverName ?? "",
    driver2Name: apiTrip.Driver2Name ?? "",
  };
}
export async function getVehicleTrips(
  vehicleCode: string,
  from: string,
  to: string,
): Promise<VehicleTrip[]> {
  const data = await apiRequest<VehicleTripApi[]>(
    `/vehicle/${vehicleCode}/trips?from=${from}&to=${to}`,
  );
  return data.map(mapVehicleTrip);
}

function mapHistoryPoint(
  point: VehicleHistoryApi["Positions"][number],
): VehicleHistoryPoint {
  return {
    lat: Number(point.Lat),
    lng: Number(point.Lng),
    time: point.Time,
    speed: point.Speed,
  };
}
export async function getVehicleHistory(
  vehicleCode: string,
  from: string,
  to: string,
): Promise<VehicleHistoryPoint[]> {
  const data = await apiRequest<VehicleHistoryApi[]>(
    `/vehicles/history/${vehicleCode}?from=${from}&to=${to}`,
  );
  const firstVehicle = data[0];
  if (!firstVehicle) return [];
  return firstVehicle.Positions.map(mapHistoryPoint);
}

function mapVehicle(apiVehicle: VehicleApi): Vehicle {
  return {
    id: apiVehicle.Code,
    code: apiVehicle.Code,
    groupCode: apiVehicle.GroupCode,
    name: apiVehicle.Name,
    spz: apiVehicle.SPZ ?? "",
    speed: apiVehicle.Speed,
    branchName: apiVehicle.BranchName ?? "",
    lat: apiVehicle.LastPosition
      ? Number(apiVehicle.LastPosition.Latitude)
      : null,
    lng: apiVehicle.LastPosition
      ? Number(apiVehicle.LastPosition.Longitude)
      : null,
    lastPositionTimestamp: apiVehicle.LastPositionTimestamp ?? null,
  };
}
export async function getVehiclesByGroup(
  groupCode: string,
): Promise<Vehicle[]> {
  const data = await apiRequest<VehicleApi[]>(`/vehicles/group/${groupCode}`);
  return data.map(mapVehicle);
}

export type VehicleHistoryPositionApi = {
  Lat: string;
  Lng: string;
  Time: string;
  Speed: number;
};
export type VehicleHistoryApi = {
  Name: string;
  VehicleCode: string;
  From: string;
  To: string;
  Positions: VehicleHistoryPositionApi[];
};
export type VehicleHistoryPoint = {
  lat: number;
  lng: number;
  time: string;
  speed: number;
};
