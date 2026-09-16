import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { ClimaService } from './clima.service';

/**
 * Pruebas unitarias de `ClimaService`: verifica el mapeo de campos (con alias)
 * y que se use el endpoint configurado para clima.
 */
describe('ClimaService', () => {
  let service: ClimaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ClimaService],
    });

    service = TestBed.inject(ClimaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería mapear la respuesta al modelo CiudadClima usando alias de campos', () => {
    let resultado: unknown;

    service.getCiudades(0, 5).subscribe((page) => {
      resultado = page;
    });

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}${environment.climaPath}?page=0&size=5`,
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ city: 'Bogotá', country: 'Colombia', temperature: 14, humidity: 80, id: 7 }]);

    const page = resultado as {
      content: { ciudad: string; pais: string; temperatura: number; humedad: number }[];
    };
    expect(page.content[0].ciudad).toBe('Bogotá');
    expect(page.content[0].pais).toBe('Colombia');
    expect(page.content[0].temperatura).toBe(14);
    expect(page.content[0].humedad).toBe(80);
  });

  it('debería normalizar una respuesta envuelta estilo Spring Data', () => {
    let resultado: unknown;

    service.getCiudades().subscribe((page) => {
      resultado = page;
    });

    // Usamos service['defaultPageSize'] para evitar problemas si el environment no lo define directamente
    const defaultSize = service['defaultPageSize'] ?? 10;
    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}${environment.climaPath}?page=0&size=${defaultSize}`,
    );
    
    req.flush({
      content: [{ ciudad: 'Medellín', temperatura: 24 }],
      totalElements: 42,
      totalPages: 9,
      number: 0,
      size: 5,
    });

    const page = resultado as { totalElements: number; totalPages: number; content: unknown[] };
    expect(page.totalElements).toBe(42);
    expect(page.totalPages).toBe(9);
    expect(page.content.length).toBe(1);
  });
});