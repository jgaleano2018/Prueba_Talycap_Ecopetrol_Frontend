// Entorno de desarrollo (reemplaza a `environment.ts` con `ng serve --configuration development`).
// Autocontenido a propósito: no importa `./environment` porque ese archivo es
// reemplazado por este mismo durante el build, lo que provocaría una referencia circular.
export const environment = {
  production: false,
  /** URL base de las APIs REST (películas y clima). */
  apiBaseUrl: 'https://localhost:44357',
  /** Ruta relativa del endpoint de películas. */
  peliculasPath: '/api/peliculas',
  /** Ruta relativa del endpoint de clima. */
  climaPath: '/api/clima',
  /** Tiempo máximo de espera por petición HTTP (ms). */
  httpTimeoutMs: 15000,
  /** Tamaño de página por defecto de los paginadores. */
  defaultPageSize: 5,
  /** API key opcional: se provee por variable de entorno del pipeline. */
  apiKey: '',
};
