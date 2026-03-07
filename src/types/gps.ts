export type GroupApi = {
  Code: string;
  Name: string;
};

export type Group = {
  code: string;
  name: string;
};

export type VehicleApi = {
  Code: string;
  GroupCode: string;
  BranchId?: string;
  BranchName?: string;
  Name: string;
  SPZ?: string;
  Speed: number;
  LastPosition?: {
    Latitude: string;
    Longitude: string;
  };
  LastPositionTimestamp?: string;
};

export type Vehicle = {
  id: string;
  code: string;
  groupCode: string;
  name: string;
  spz: string;
  speed: number;
  branchName: string;
  lat: number | null;
  lng: number | null;
  lastPositionTimestamp: string | null;
};

export type VehicleWithDistance = Vehicle & {
  distanceKm: number;
  etaMinutes: number;
};

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

export type VehicleTripApi = {
  AverageSpeed: number;
  MaxSpeed: number;
  StartTime: string;
  FinishTime: string;
  TripLength: string;
  TripWaitingTime?: string;
  TotalDistance: number;
  Purpose?: string;
  DriverName?: string;
  Driver2Name?: string;
};

export type VehicleTrip = {
  averageSpeed: number;
  maxSpeed: number;
  startTime: string;
  finishTime: string;
  tripLength: string;
  tripWaitingTime: string;
  totalDistance: number;
  purpose: string;
  driverName: string;
  driver2Name: string;
};

export type GeocodingResultApi = {
  lat: string;
  lon: string;
  display_name: string;
};
export type GeocodingResult = {
  lat: number;
  lng: number;
  label: string;
};
