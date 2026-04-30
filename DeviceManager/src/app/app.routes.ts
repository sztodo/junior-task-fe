import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  {
    path: 'devices',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/devices/device-list/device-list').then((m) => m.DeviceList),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/devices/device-form/device-form').then((m) => m.DeviceForm),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./components/devices/device-form/device-form').then((m) => m.DeviceForm),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/devices/device-detail/device-detail').then((m) => m.DeviceDetail),
      },
      {
        path: '**',
        redirectTo: 'devices',
      },
    ],
  },
];
