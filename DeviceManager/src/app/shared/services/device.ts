import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  UpsertDeviceRequest,
  Device as DeviceModel,
  AssignDeviceRequest,
} from '../models/device.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Device {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/Device';

  private readonly _devices = signal<DeviceModel[]>([]);
  private readonly _selectedDevice = signal<DeviceModel | null>(null);
  private readonly _loading = signal(false);

  // selectors
  readonly devices = this._devices.asReadonly();
  readonly selectedDevice = this._selectedDevice.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalDevices = computed(() => this._devices().length);
  readonly assignedDevices = computed(() => this._devices().filter((d) => d.assignedUserId));
  readonly unassignedDevices = computed(() => this._devices().filter((d) => !d.assignedUserId));

  constructor() {}
  loadAll(): Observable<DeviceModel[]> {
    this._loading.set(true);
    return this.http.get<DeviceModel[]>(this.baseUrl).pipe(
      tap({
        next: (devices) => {
          this._devices.set(devices);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  getById(id: number): Observable<DeviceModel> {
    this._loading.set(true);
    return this.http.get<DeviceModel>(`${this.baseUrl}/${id}`).pipe(
      tap({
        next: (device) => {
          this._selectedDevice.set(device);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  create(request: UpsertDeviceRequest): Observable<DeviceModel> {
    this._loading.set(true);
    return this.http.post<DeviceModel>(this.baseUrl, request).pipe(
      tap({
        next: (device) => {
          this._devices.update((list) => [...list, device]);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  update(id: number, request: UpsertDeviceRequest): Observable<DeviceModel> {
    this._loading.set(true);
    return this.http.put<DeviceModel>(`${this.baseUrl}/${id}`, request).pipe(
      tap({
        next: (updated) => {
          this._devices.update((list) => list.map((d) => (d.id === id ? updated : d)));
          this._selectedDevice.set(updated);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  delete(id: number): Observable<void> {
    this._loading.set(true);
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap({
        next: () => {
          this._devices.update((list) => list.filter((d) => d.id !== id));
          if (this._selectedDevice()?.id === id) this._selectedDevice.set(null);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      }),
    );
  }

  assignUser(deviceId: number, request: AssignDeviceRequest): Observable<DeviceModel> {
    return this.http.patch<DeviceModel>(`${this.baseUrl}/${deviceId}/assign`, request).pipe(
      tap((updated) => {
        this._devices.update((list) => list.map((d) => (d.id === deviceId ? updated : d)));
        this._selectedDevice.set(updated);
      }),
    );
  }

  selectDevice(device: DeviceModel | null): void {
    this._selectedDevice.set(device);
  }

  existsByName(name: string, excludeId?: number): boolean {
    return this._devices().some(
      (d) => d.name.toLowerCase() === name.toLowerCase() && d.id !== excludeId,
    );
  }

  selfAssign(deviceId: number): Observable<DeviceModel> {
    return this.http.post<DeviceModel>(`${this.baseUrl}/${deviceId}/self-assign`, {}).pipe(
      tap((updated) => {
        this._devices.update((list) => list.map((d) => (d.id === deviceId ? updated : d)));
        this._selectedDevice.set(updated);
      }),
    );
  }

  selfUnassign(deviceId: number): Observable<DeviceModel> {
    return this.http.delete<DeviceModel>(`${this.baseUrl}/${deviceId}/self-unassign`).pipe(
      tap((updated) => {
        this._devices.update((list) => list.map((d) => (d.id === deviceId ? updated : d)));
        this._selectedDevice.set(updated);
      }),
    );
  }
}
