// Ambiente de produccion.
// Los marcadores de API son reemplazados en el pipeline CI/CD
// (scripts/set-environment.mjs) por los valores parametrizados en GitHub Actions.
// Nunca se versionan credenciales reales.
// Autocontenido a proposito: no importa ./environment porque ese archivo es
// reemplazado por este mismo durante el build, lo que provocaria una referencia circular.
export const environment = {
  production: true,
  apiBaseUrl: '__API_BASE_URL__',
  peliculasPath: '/api/peliculas',
  climaPath: '/api/clima',
  httpTimeoutMs: 15000,
  defaultPageSize: 5,
  apiKey: '__API_KEY__',
};
