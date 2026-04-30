export interface User {
  id: number;
  name: string;
  role: string;
  location: string;
  assignedDevices: DeviceSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface DeviceSummary {
  id: number;
  name: string;
  manufacturer: string;
}

export interface UpsertUserRequest {
  name: string;
  role: string;
  location: string;
}
