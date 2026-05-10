import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { APP_INITIALIZER } from '@angular/core';

import { routes } from './app.routes';
import { AuthService } from './services/auth';

// ✅ ADD THIS (missing piece)
export function initAuthFactory(auth: AuthService) {
  return () => auth.initAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    {
      provide: APP_INITIALIZER,
      useFactory: initAuthFactory,
      deps: [AuthService],
      multi: true
    }
  ]
};