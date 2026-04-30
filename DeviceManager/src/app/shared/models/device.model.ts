export enum DeviceType {
  Phone = 1,
  Tablet = 2,
}

export interface Device {
  id: number;
  name: string;
  manufacturer: string;
  typeLabel: string;
  operatingSystem: string;
  osVersion: string;
  processor: string;
  ramAmount: number;
  description?: string;
  assignedUserId?: number;
  assignedUserName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertDeviceRequest {
  name: string;
  manufacturer: string;
  type: DeviceType;
  operatingSystem: string;
  osVersion: string;
  processor: string;
  ramAmount: number;
  description?: string;
  assignedUserId?: number;
}

export interface AssignDeviceRequest {
  userId: number | null;
}
