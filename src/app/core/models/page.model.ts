/**
 * Contrato de paginación compartido por todos los listados de la aplicación.
 * La API del backend puede devolver la colección "plana" o envuelta; el
 * servicio normaliza ambos casos (ver `normalizeCollection`).
 */
export interface Pageable {
  /** Número de página solicitada (0-based, como espera Angular Material). */
  readonly page: number;
  /** Cantidad de registros por página. */
  readonly size: number;
  /** Ordenamiento, si el backend lo soporta (formato `campo,asc|desc`). */
  readonly sort?: string;
}

/** Envoltura estándar de paginación tipo Spring Data / .NET. */
export interface PageResponse<T> {
  readonly content: T[];
  readonly totalElements: number;
  readonly totalPages: number;
  readonly number: number;
  readonly size: number;
}

/**
 * Estructura de error normalizada que usan los componentes para mostrar
 * feedback consistente al usuario (snackbar, estado vacío, etc.).
 */
export interface ApiError {
  /** Mensaje apto para mostrar al usuario final. */
  readonly message: string;
  /** Código HTTP (0 cuando es un error de red o timeout). */
  readonly status: number;
  /** Detalle técnico opcional (solo se registra en consola). */
  readonly detail?: string;
}

/**
 * Representa una fila de cualquier tabla paginada.
 * Se usa como restricción genérica para reutilizar la tabla compartida.
 */
export interface Identifiable {
  readonly id: string | number;
}
