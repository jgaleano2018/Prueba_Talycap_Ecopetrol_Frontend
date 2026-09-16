import { Routes } from '@angular/router';

/**
 * Rutas de la feature de películas.
 * Se exporta como constante para ser consumida por `loadChildren` (lazy loading).
 */
export const PELICULAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./peliculas-list.component').then((m) => m.PeliculasListComponent),
    title: 'Películas · Centro de Consulta',
  },
];
