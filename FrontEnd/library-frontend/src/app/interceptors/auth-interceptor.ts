// interceptors/auth.interceptor.ts (or wherever it is)

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // List of public endpoints that should NOT include Authorization header
  const publicEndpoints = [
    '/api/register/',
    '/api/token/',
    '/api/token/refresh/',
    '/api/verify-email/',
    '/api/resend-verification-email/',
    '/api/password-reset-request/',
    '/api/password-reset-confirm/',
    '/api/change-password/',  // if you ever use it as public
  ];

  const isPublicEndpoint = publicEndpoints.some(endpoint =>
    req.url.endsWith(endpoint)
  );

  // Only add token if it's NOT a public endpoint and we have a token
  if (!isPublicEndpoint && token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};