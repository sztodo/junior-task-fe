import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  {
    path: 'devices',
    loadComponent: () =>
      import('./components/devices/device-list/device-list').then((m) => m.DeviceList),
  },
];
