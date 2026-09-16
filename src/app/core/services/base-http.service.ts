import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of, OperatorFunction, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiError, Identifiable, PageResponse } from '../models/page.model';

/**
 * Servicio HTTP base del que heredan los servicios de cada recurso.
 *
 * Centraliza:
 *  - la construcción de URLs a partir de `environment.apiBaseUrl`;
 *  - la normalización de respuestas (listas planas o paginadas);
 *  - el mapeo defensivo a un modelo tipado;
 *  - el manejo de errores (re-lanza un `ApiError` legible).
 *
 * Es una clase abstracta (no un componente) por lo que no necesita decorador.
 */
@Injectable()
export abstract class BaseHttpService {
  protected readonly http = inject(HttpClient);

  /** URL base de la API, parametrizada por ambiente. */
  protected readonly baseUrl = environment.apiBaseUrl;

  /** Tamaño de página por defecto leído de la configuración de ambiente. */
  protected readonly defaultPageSize = environment.defaultPageSize;

  /**
   * Construye la URL absoluta de un recurso.
   */
  protected buildUrl(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  }

  /**
   * Realiza un GET y normaliza la respuesta a una `PageResponse<T>`.
   *
   * Soporta tres formatos de backend habituales:
   *  1. Array plano: `[ {...}, {...} ]`.
   *  2. Envoltura `{ data: [...], total: n }`.
   *  3. Envoltura Spring Data: `{ content: [...], totalElements: n }`.
   * Cuando no hay información de paginación, la paginación se resuelve en
   * el cliente (ver `mapCollection` en cada servicio concreto).
   */
  protected getCollection<T>(
    path: string,
    page = 0,
    size = this.defaultPageSize,
    extraParams?: Record<string, string | number>,
  ): Observable<PageResponse<T>> {
    let params = new HttpParams().set('page', page).set('size', size);

    for (const [key, value] of Object.entries(extraParams ?? {})) {
      params = params.set(key, value);
    }

    return this.http.get<unknown>(this.buildUrl(path), { params }).pipe(
      map((response) => this.normalizeCollection<T>(response, page, size)),
      catchError((error: unknown) => throwError(() => error)),
    );
  }

  /**
   * Convierte la respuesta cruda del backend en una colección tipada.
   * @param itemMapper función que transforma un elemento crudo al modelo.
   */
  protected mapResponse<T>(
    raw$: Observable<PageResponse<unknown>>,
    itemMapper: (item: unknown, index: number) => T,
  ): Observable<PageResponse<T>> {
    return raw$.pipe(
      map((page) => ({
        ...page,
        content: page.content.map((item, index) => itemMapper(item, index)),
      })),
    );
  }

  /** Log de diagnóstico y re-lanzamiento de errores ya normalizados. */
  protected handleError<T>(context: string): (error: unknown) => Observable<T> {
    return (error: unknown) => {
      const apiError = error as ApiError;
      console.error(`[${context}] Error al consumir la API:`, apiError?.detail ?? apiError);
      return throwError(() => apiError);
    };
  }

  /** Normaliza las múltiples formas de respuesta paginada a `PageResponse<T>`. */
  private normalizeCollection<T>(response: unknown, page: number, size: number): PageResponse<T> {
    if (Array.isArray(response)) {
      return this.clientSidePage<T>(response as T[], page, size);
    }

    if (response && typeof response === 'object') {
      const record = response as Record<string, unknown>;
      const items = (record['content'] ?? record['data'] ?? record['items'] ?? []) as T[];

      const total = this.toNumber(
        record['totalElements'] ?? record['total'] ?? record['totalCount'] ?? items.length,
      );

      return {
        content: items,
        totalElements: total,
        totalPages: this.toNumber(record['totalPages'] ?? Math.ceil(total / size)) || 1,
        number: this.toNumber(record['number'] ?? record['page'] ?? page),
        size: this.toNumber(record['size'] ?? size),
      };
    }

    // Respuesta con forma inesperada: se devuelve una página vacía.
    return { content: [], totalElements: 0, totalPages: 0, number: page, size };
  }

  /**
   * Pagina en el cliente cuando el backend devuelve la colección completa.
   * Garantiza que la tabla siempre tenga una vista consistente.
   */
  private clientSidePage<T>(items: T[], page: number, size: number): PageResponse<T> {
    const totalElements = items.length;
    const start = page * size;
    const content = items.slice(start, start + size);

    return {
      content,
      totalElements,
      totalPages: size > 0 ? Math.ceil(totalElements / size) : 0,
      number: page,
      size,
    };
  }

  /** Convierte valores desconocidos a número sin lanzar excepciones. */
  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  /**
   * Utilidad para el mapeo defensivo: obtiene el primer campo no vacío
   * disponible en un objeto crudo del backend.
   */
  protected pick(source: Record<string, unknown>, keys: readonly string[]): unknown {
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return undefined;
  }

  /** Obtiene el primer campo no vacío y lo convierte a texto. */
  protected pickString(source: Record<string, unknown>, keys: readonly string[]): string {
    const value = this.pick(source, keys);
    return value === undefined ? '' : String(value);
  }

  /**
   * Genera un identificador estable para una fila cuando la API no expone uno.
   * Sin esto, el `track` de las tablas de Material provoca re-render innecesario.
   */
  protected stableId(source: Record<string, unknown>, index: number): string | number {
    return (this.pick(source, ['id', 'codigo', 'uuid', '_id']) as string | number | undefined) ?? `row-${index}`;
  }

  /** Utilidad de compatibilidad para servicios que necesitan `of()`. */
  protected emptyPage<T>(size = this.defaultPageSize): Observable<PageResponse<T>> {
    return of({ content: [], totalElements: 0, totalPages: 0, number: 0, size });
  }

  /** Marca de tipo para asegurar que las entidades tengan `id`. */
  protected asIdentifiable<T extends Identifiable>(item: T): T {
    return item;
  }

  /**
   * Operador `tap` de conveniencia para depurar respuestas en desarrollo.
   * Devuelve un `OperatorFunction` para poder encadenarse con `.pipe()` sin
   * alterar el flujo de datos.
   */
  protected debug<T>(label: string): OperatorFunction<T, T> {
    return tap<T>((value: T) => {
      if (!environment.production) {
        console.debug(`[${label}]`, value);
      }
    });
  }
}
