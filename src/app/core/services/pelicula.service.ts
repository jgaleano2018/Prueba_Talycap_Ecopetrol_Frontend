import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pelicula } from '../models/pelicula.model';
import { PageResponse } from '../models/page.model';
import { BaseHttpService } from './base-http.service';

/**
 * Servicio de acceso a datos de películas.
 *
 * Responsabilidad única: comunicarse con `GET /api/peliculas` y transformar la
 * respuesta en un modelo fuertemente tipado (`Pelicula`). No conoce nada de la
 * vista; los componentes consumen este servicio con el modelo reactivo.
 */
@Injectable({ providedIn: 'root' })
export class PeliculaService extends BaseHttpService {
  private readonly url = `${environment.apiBaseUrl}${environment.peliculasPath}`;

  /**
   * Obtiene una página de películas.
   * @param page índice de página (0-based, como lo usa el paginador de Material)
   * @param size cantidad de elementos por página
   * @param titulo filtro opcional por título (se envía al backend; el filtrado
   *               en cliente se aplica como respaldo en el componente)
   */
  getPeliculas(page = 0, size = this.defaultPageSize, titulo?: string): Observable<PageResponse<Pelicula>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (titulo) {
      params = params.set('titulo', titulo);
    }

    return this.http.get<any>(this.url, { params }).pipe(
      map((response) => {
        let rawItems: any[] = [];
        let totalElements = 0;
        let totalPages = 1;
        let pageNumber = page;
        let pageSize = size;

        if (Array.isArray(response)) {
          // Paginación en cliente cuando la API devuelve un array completo
          totalElements = response.length;
          totalPages = Math.ceil(totalElements / size) || 1;
          const startIndex = page * size;
          rawItems = response.slice(startIndex, startIndex + size);
        } else if (response?.content) {
          // Formato Spring Data
          rawItems = response.content;
          totalElements = response.totalElements ?? rawItems.length;
          totalPages = response.totalPages ?? 1;
          pageNumber = response.number ?? page;
          pageSize = response.size ?? size;
        } else {
          // Formato personalizado con items
          rawItems = response?.items ?? [];
          totalElements = response?.totalRegistros ?? rawItems.length;
          totalPages = response?.totalPaginas ?? 1;
          pageNumber = response?.page ?? page;
          pageSize = response?.size ?? size;
        }

        const mappedItems = rawItems.map((item: unknown, index: number) => this.toViewModel(item, index));

        return {
          content: mappedItems,
          totalElements,
          totalPages,
          number: pageNumber,
          size: pageSize,
        };
      }),
      this.debug('PeliculaService.getPeliculas')
    );
  }

  /**
   * Mapea un elemento crudo de la API al modelo `Pelicula`.
   * Se asigna de forma segura el identificador único del backend a `id`.
   */
  private toViewModel(item: unknown, index: number): Pelicula {
    const source = (item ?? {}) as Record<string, unknown>;
    const rawId = source['peliculaID'] ?? source['id'];

    // Validamos estrictamente que sea string o number, de lo contrario usamos stableId
    const resolvedId = (typeof rawId === 'string' || typeof rawId === 'number') 
      ? rawId 
      : this.stableId(source, index);

    return {
      ...source,
      id: resolvedId,
      titulo: this.pickString(source, ['titulo', 'title', 'nombre', 'name']) || `Película ${index + 1}`,
      anio: this.pick(source, ['anio', 'año', 'year', 'releaseYear']) as Pelicula['anio'],
      genero: this.pickString(source, ['genero', 'género', 'genre']) || null,
      director: this.pickString(source, ['director', 'author']) || null,
      sinopsis: this.pickString(source, ['sinopsis', 'overview', 'descripcion', 'description']) || null,
      duracion: this.pick(source, ['duracion', 'duration', 'runtime']) as Pelicula['duracion'],
      estudio: this.pickString(source, ['estudio', 'studio', 'productora', 'company']) || null,
    };
  }
}