// Entornos de compilación.
// IMPORTANTE: este archivo NO debe contener secretos ni tokens.
// `apiKey` queda vacío a propósito; en el pipeline se inyecta desde GitHub
// Secrets (ver .github/workflows/deploy.yml) con `scripts/set-environment.mjs`.
export const environment = {
  production: false,
  /** URL base de las APIs REST (películas y clima). */
  apiBaseUrl: 'https://localhost:44357',
  /** Ruta relativa del endpoint de películas. */
  peliculasPath: '/api/peliculas',
  /** Ruta relativa del endpoint de clima (tal como lo expone el backend). */
  climaPath: '/api/clima',
  /** Tiempo máximo de espera por petición HTTP (ms). */
  httpTimeoutMs: 15000,
  /** Tamaño de página por defecto de los paginadores. */
  defaultPageSize: 5,
  /** API key opcional: se provee por variable de entorno del pipeline. */
  apiKey: '',
};
