/**
 * Inyecta variables de ambiente parametrizadas en los archivos de entorno
 * durante el pipeline CI/CD.
 *
 * Uso:
 *   node scripts/set-environment.mjs <target>
 *
 *   target: development | staging | production
 *
 * Variables de entorno leídas (todas opcionales, con valor por defecto seguro):
 *   API_BASE_URL      -> URL base de las APIs REST
 *   API_KEY           -> key opcional para el backend
 *   PELICULAS_PATH    -> ruta del endpoint de películas
 *   CLIMA_PATH        -> ruta del endpoint de clima
 *   HTTP_TIMEOUT_MS   -> timeout por petición en ms
 *   DEFAULT_PAGE_SIZE -> tamaño de página por defecto
 *
 * Los archivos con marcadores (`environment.prod.ts`, `environment.staging.ts`)
 * se reescriben reemplazando `__API_BASE_URL__` y `__API_KEY__`. No se versiona
 * ningún secreto: los valores llegan desde GitHub Secrets/Variables.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

/** Mapa de target -> archivo de entorno a reescribir. */
const TARGETS = {
  development: 'src/environments/environment.development.ts',
  staging: 'src/environments/environment.staging.ts',
  production: 'src/environments/environment.prod.ts',
};

const target = process.argv[2] ?? 'production';
const relativeFile = TARGETS[target];

if (!relativeFile) {
  console.error(`[set-environment] Target inválido: "${target}". Use development | staging | production.`);
  process.exit(1);
}

const env = process.env;

/** Valor de ambiente o valor por defecto. */
const value = (name, fallback) => {
  const raw = env[name];
  return raw === undefined || raw === '' ? fallback : raw;
};

const replacements = {
  __API_BASE_URL__: value('API_BASE_URL', 'http://localhost:44357'),
  __API_KEY__: value('API_KEY', ''),
};

const absoluteFile = resolve(projectRoot, relativeFile);

if (!existsSync(absoluteFile)) {
  console.error(`[set-environment] No se encontró el archivo: ${relativeFile}`);
  process.exit(1);
}

let contenido = readFileSync(absoluteFile, 'utf8');

// Solo se sustituyen los marcadores cuando aparecen como valor de una propiedad
// (`apiBaseUrl: '__API_BASE_URL__'`), evitando tocar comentarios o documentación.
for (const [marcador, valor] of Object.entries(replacements)) {
  const patron = new RegExp(`(:\\s*)'${marcador}'`, 'g');
  contenido = contenido.replace(patron, `$1'${valor.replace(/'/g, "\\'")}'`);
}

// Parámetros opcionales: se ajustan solo si la variable está definida.
const opcionales = {
  peliculasPath: env.PELICULAS_PATH,
  climaPath: env.CLIMA_PATH,
  httpTimeoutMs: env.HTTP_TIMEOUT_MS,
  defaultPageSize: env.DEFAULT_PAGE_SIZE,
};

for (const [clave, valor] of Object.entries(opcionales)) {
  if (valor === undefined || valor === '') {
    continue;
  }
  const numero = /^\d+$/.test(valor) ? valor : `'${valor}'`;
  const patron = new RegExp(`(${clave}:\\s*)[^,\\n]+`);
  contenido = contenido.replace(patron, `$1${numero}`);
}

writeFileSync(absoluteFile, contenido, 'utf8');

console.log(`[set-environment] Archivo actualizado: ${relativeFile} (target: ${target}).`);
