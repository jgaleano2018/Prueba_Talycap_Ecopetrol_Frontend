// Ambiente de staging (pre-producción).
// La URL real se inyecta desde las variables parametrizadas del pipeline de
// GitHub Actions (`scripts/set-environment.mjs`).
// Autocontenido a propósito: no importa `./environment` porque ese archivo es
// reemplazado por este mismo durante el build, lo que provocaría una referencia circular.
export const environment = {
  production: true,
  apiBaseUrl: '__API_BASE_URL__',
  peliculasPath: '/api/peliculas',
  climaPath: '/api/clima',
  httpTimeoutMs: 15000,
  defaultPageSize: 5,
  apiKey: '__API_KEY__',
};
