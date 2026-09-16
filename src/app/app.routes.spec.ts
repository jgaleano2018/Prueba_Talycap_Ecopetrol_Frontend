import { routes } from './app.routes';

/**
 * Pruebas de configuración de rutas.
 * Se valida que las features estén declaradas con `loadChildren`/`loadComponent`,
 * que es lo que habilita el lazy loading exigido por la prueba técnica.
 */
describe('app.routes', () => {
  it('debería declarar la ruta home con carga diferida', () => {
    const home = routes.find((route) => route.path === 'home');
    expect(home).toBeTruthy();
    expect(typeof home?.loadComponent).toBe('function');
  });

  it('debería declarar películas y clima con lazy loading vía loadChildren', () => {
    const peliculas = routes.find((route) => route.path === 'peliculas');
    const clima = routes.find((route) => route.path === 'clima');

    expect(typeof peliculas?.loadChildren).toBe('function');
    expect(typeof clima?.loadChildren).toBe('function');
  });

  it('debería redirigir la raíz a home', () => {
    const raiz = routes.find((route) => route.path === '');
    expect(raiz?.redirectTo).toBe('home');
    expect(raiz?.pathMatch).toBe('full');
  });

  it('debería tener una ruta comodín para páginas no encontradas', () => {
    const comodin = routes.find((route) => route.path === '**');
    expect(comodin).toBeTruthy();
    expect(typeof comodin?.loadComponent).toBe('function');
  });
});
