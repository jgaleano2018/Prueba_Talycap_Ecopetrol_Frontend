import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { environment } from '../../../environments/environment';
import { PeliculaService } from './pelicula.service';

/**
 * Pruebas unitarias de `PeliculaService`.
 * Se verifica el mapeo defensivo de la respuesta y el filtrado del endpoint.
 */
describe('PeliculaService', () => {
  let service: PeliculaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PeliculaService],
    });

    service = TestBed.inject(PeliculaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería mapear una respuesta en array plano al modelo Pelicula', () => {
    let resultado: unknown;

    service.getPeliculas(0, 5).subscribe((page) => {
      resultado = page;
    });

    const url = `${environment.apiBaseUrl}${environment.peliculasPath}?page=0&size=5`;
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([{ title: 'Matrix', year: 1999, genre: 'Sci-Fi', id: 1 }]);

    const page = resultado as { content: { titulo: string; anio: number; genero: string }[] };
    expect(page.content.length).toBe(1);
    expect(page.content[0].titulo).toBe('Matrix');
    expect(page.content[0].anio).toBe(1999);
    expect(page.content[0].genero).toBe('Sci-Fi');
  });

  it('debería generar un título por defecto cuando la API no lo provee', () => {
    let resultado: unknown;

    service.getPeliculas().subscribe((page) => {
      resultado = page;
    });

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}${environment.peliculasPath}?page=0&size=${service['defaultPageSize']}`,
    );
    req.flush([{ descripcion: 'sin título' }]);

    const page = resultado as { content: { titulo: string; id: string }[] };
    expect(page.content[0].titulo).toBe('Película 1');
    // Sin id en la respuesta se resuelve un id estable en el cliente.
    expect(page.content[0].id).toBe('row-0');
  });

  it('debería enviar el parámetro `titulo` cuando se aplica un filtro', () => {
    service.getPeliculas(0, 5, 'Matrix').subscribe();

    // Usamos el match de URL base y validamos los params individualmente de forma robusta
    const baseUrl = `${environment.apiBaseUrl}${environment.peliculasPath}`;
    const req = httpMock.expectOne((r) => r.url === baseUrl);
    
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('5');
    expect(req.request.params.get('titulo')).toBe('Matrix');
    
    req.flush([]);
  });

  it('debería paginar en cliente cuando la API devuelve un array completo', () => {
    let resultado: unknown;

    service.getPeliculas(1, 2).subscribe((page) => {
      resultado = page;
    });

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}${environment.peliculasPath}?page=1&size=2`,
    );
    req.flush([{ title: 'A' }, { title: 'B' }, { title: 'C' }]);

    const page = resultado as { content: unknown[]; totalElements: number; totalPages: number };
    expect(page.content.length).toBe(1);
    expect(page.totalElements).toBe(3);
    expect(page.totalPages).toBe(2);
  });
});