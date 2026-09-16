import { Routes } from '@angular/router';

/**
 * Rutas de la feature de clima.
 *
 * Se exporta como constante para ser consumida por `loadChildren`, de modo que
 * el componente de la feature se descargue de forma diferida (lazy loading).
 */
export const CLIMA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./clima-list.component').then((m) => m.ClimaListComponent),
    title: 'Clima · Centro de Consulta',
  },
];
