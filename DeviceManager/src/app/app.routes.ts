import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'devices', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'devices',
    canActivate: [authGuard],
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
