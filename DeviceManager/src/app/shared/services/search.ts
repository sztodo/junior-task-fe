import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Device as DeviceModel } from '../models/device.model';

@Injectable({
  providedIn: 'root',
})
export class Search {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/Search';
  private readonly _devices = signal<DeviceModel[]>([]);

  // selectors
  readonly devices = this._devices.asReadonly();

  constructor() {}
  searchDevices(term: string): Observable<DeviceModel[]> {
    const params = new HttpParams().set('q', term);
    return this.http.get<DeviceModel[]>(`${this.baseUrl}/devices/`, { params }).pipe(
      tap({
        next: (devices) => {
          this._devices.set(devices);
        },
      }),
    );
  }
}
