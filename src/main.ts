import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Punto de entrada de la aplicación.
 * Se utiliza el bootstrap basado en `ApplicationConfig` (standalone APIs de Angular 20),
 * lo que elimina la necesidad de `NgModule` raíz.
 */
bootstrapApplication(AppComponent, appConfig).catch((error) =>
  // Si el arranque falla (p. ej. error de configuración) lo dejamos visible en consola.
  console.error('Error al inicializar la aplicación:', error),
);
