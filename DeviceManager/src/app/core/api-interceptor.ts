import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Toaster } from './services/toaster';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

const TOKEN_KEY = 'dm_token';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(Toaster);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  let apiReq = req.clone({
    url: req.url.startsWith('http') ? req.url : `${environment.apiUrl}${req.url}`,
  });

  if (isBrowser) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      apiReq = apiReq.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return next(apiReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        if (isBrowser) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('dm_user');
          router.navigate(['/login']);
          toaster.error('Session expired. Please log in again.');
        }
      } else {
        const message =
          error.error?.error ??
          error.error?.message ??
          error.message ??
          'An unexpected error occurred';
        toaster.error(message);
      }
      return throwError(() => error);
    }),
  );
};
