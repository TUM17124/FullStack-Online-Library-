import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, switchMap, throwError, from } from 'rxjs';

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const publicEndpoints = [
    '/api/register/',
    '/api/token/',
    '/api/token/refresh/',
    '/api/verify-email/',
    '/api/resend-verification-email/',
    '/api/password-reset-request/',
    '/api/password-reset-confirm/',
    '/api/change-password/',
  ];

  const isPublicEndpoint = publicEndpoints.some(endpoint =>
    req.url.endsWith(endpoint)
  );

  let authReq = req;

  // attach token
  if (!isPublicEndpoint && token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError(err => {

      if (err.status === 401 && !isPublicEndpoint) {

        // 🔥 If refresh already running → reuse it
        if (!isRefreshing) {
          isRefreshing = true;

          refreshPromise = authService.refreshToken()
            .toPromise()
            .then((res: any) => {
              localStorage.setItem('access_token', res.access);
              isRefreshing = false;
              return res.access;
            })
            .catch((error) => {
              isRefreshing = false;
              authService.logout();
              throw error;
            });
        }

        return from(refreshPromise!).pipe(
          switchMap((newToken: string) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(retryReq);
          })
        );
      }

      return throwError(() => err);
    })
  );
};