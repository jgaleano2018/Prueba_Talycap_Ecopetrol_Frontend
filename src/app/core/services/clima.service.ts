import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CiudadClima } from '../models/ciudad-clima.model';
import { PageResponse } from '../models/page.model';
import { BaseHttpService } from './base-http.service';

@Injectable({ providedIn: 'root' })
export class ClimaService extends BaseHttpService {
  private readonly url = `${environment.apiBaseUrl}${environment.climaPath}`;

  getCiudades(page = 0, size = this.defaultPageSize, ciudad?: string): Observable<PageResponse<CiudadClima>> {
    let endpointUrl = `${this.url}?page=${page}&size=${size}`;
    if (ciudad) {
      endpointUrl += `&ciudad=${encodeURIComponent(ciudad)}`;
    }

    return this.http.get<any>(endpointUrl).pipe(
      map((response) => {
        // Soporte flexible para Spring Data (content), formato personalizado (items) o array plano
        const isArray = Array.isArray(response);
        const rawItems = isArray ? response : (response?.content ?? response?.items ?? []);
        const mappedItems = rawItems.map((item: unknown, index: number) => this.toViewModel(item, index));

        return {
          content: mappedItems,
          totalElements: isArray ? mappedItems.length : (response?.totalElements ?? response?.totalRegistros ?? mappedItems.length),
          totalPages: isArray ? 1 : (response?.totalPages ?? response?.totalPaginas ?? 1),
          number: isArray ? page : (response?.number ?? response?.page ?? page),
          size: isArray ? size : (response?.size ?? size),
        };
      }),
      this.debug('ClimaService.getCiudades')
    );
  }

  private toViewModel(item: unknown, index: number): CiudadClima {
    const source = (item ?? {}) as Record<string, unknown>;

    return {
      ...source,
      id: this.stableId(source, index),
      ciudad: this.pickString(source, ['ciudad', 'city', 'nombre', 'name', 'municipio']) || `Ciudad ${index + 1}`,
      pais: this.pickString(source, ['pais', 'país', 'country', 'region']) || null,
      temperatura: this.pick(source, ['temperatura', 'temperature', 'temp']) as CiudadClima['temperatura'],
      humedad: this.pick(source, ['humedad', 'humidity']) as CiudadClima['humedad'],
      descripcion: this.pickString(source, ['condicion', 'descripcion', 'descripción', 'description', 'estado']) || null,
      viento: this.pick(source, ['vientoVelocidad', 'viento', 'wind', 'windSpeed']) as CiudadClima['viento'],
    };
  }
}