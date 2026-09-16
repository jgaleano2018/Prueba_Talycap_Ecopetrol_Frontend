/**
 * Modelo de una película devuelta por `GET /api/peliculas`.
 *
 * La API original puede no devolver un `id`, por eso `id` se resuelve en el
 * mapeo del servicio (ver `PeliculaService.toViewModel`) usando un índice.
 * Los campos opcionales se declaran como `unknown`/nullable porque la respuesta
 * externa no está tipada: el popup de detalle renderiza cualquier propiedad
 * adicional de forma segura.
 */
export interface Pelicula {
  /** Identificador interno (resuelto por el cliente si la API no lo expone). */
  readonly id: string | number;
  /** Título de la película: columna principal de la tabla. */
  readonly titulo: string;
  /** Año de estreno, si viene en la respuesta. */
  readonly anio?: number | string | null;
  /** Género(s) de la película. */
  readonly genero?: string | null;
  /** Director. */
  readonly director?: string | null;
  /** Sinopsis / descripción larga. */
  readonly sinopsis?: string | null;
  /** Duración en minutos. */
  readonly duracion?: number | string | null;
  /** Estudio o productora. */
  readonly estudio?: string | null;
  /** Cualquier campo extra que devuelva la API se conserva para el detalle. */
  readonly [extra: string]: unknown;
}
