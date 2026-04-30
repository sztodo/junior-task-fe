import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Toaster } from './services/toaster';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const toaster = inject(Toaster);
  const apiReq = req.clone({
    url: req.url.startsWith('http') ? req.url : `${environment.apiUrl}${req.url}`,
  });

  return next(apiReq).pipe(
    catchError((error) => {
      const message =
        error.error?.error ??
        error.error?.message ??
        error.message ??
        'An unexpected error occurred';

      toaster.error(message);
      return throwError(() => error);
    }),
  );
};
