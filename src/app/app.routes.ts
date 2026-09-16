import { Routes } from '@angular/router';

/**
 * Rutas de la aplicación.
 *
 * `home` es el punto de entrada y agrupa, mediante `MatTabs`, las features de
 * películas y clima. Cada feature mantiene además su propia ruta (lazy loaded)
 * para permitir enlaces directos y una separación clara de responsabilidades.
 */
export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./features/home.component').then((m) => m.HomeComponent),
    title: 'Home · Centro de Consulta',
  },
  {
    path: 'peliculas',
    loadChildren: () =>
      import('./features/peliculas/peliculas.routes').then((m) => m.PELICULAS_ROUTES),
    title: 'Películas',
  },
  {
    path: 'clima',
    loadChildren: () => import('./features/clima/clima.routes').then((m) => m.CLIMA_ROUTES),
    title: 'Clima',
  },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Página no encontrada',
  },
];
