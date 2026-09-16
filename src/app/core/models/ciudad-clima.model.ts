/**
 * Modelo de un registro de clima devuelto por `GET /ap/clima`.
 *
 * La columna principal de la tabla es el nombre de la ciudad; el resto de
 * campos (temperatura, humedad, etc.) se muestran en el popup de detalle.
 */
export interface CiudadClima {
  /** Identificador interno (resuelto por el cliente si la API no lo expone). */
  readonly id: string | number;
  /** Nombre de la ciudad: columna principal de la tabla. */
  readonly ciudad: string;
  /** País o región, si viene en la respuesta. */
  readonly pais?: string | null;
  /** Temperatura reportada (puede venir como número o texto). */
  readonly temperatura?: number | string | null;
  /** Humedad relativa en porcentaje. */
  readonly humedad?: number | string | null;
  /** Descripción del estado del cielo. */
  readonly descripcion?: string | null;
  /** Velocidad del viento. */
  readonly viento?: number | string | null;
  /** Cualquier campo extra que devuelva la API se conserva para el detalle. */
  readonly [extra: string]: unknown;
}
