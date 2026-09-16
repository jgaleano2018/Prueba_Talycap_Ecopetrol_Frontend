import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

/**
 * Configuración global de la aplicación (equivale al antiguo `AppModule`).
 *
 * - `provideRouter`          : rutas con lazy loading por feature.
 * - `provideHttpClient`      : HttpClient funcional con interceptores de carga y errores.
 * - `provideAnimationsAsync` : animaciones requeridas por Angular Material.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([loadingInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
  ],
};
