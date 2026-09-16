import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { PeliculasListComponent } from './peliculas-list.component';
import { PeliculaService } from '../../core/services/pelicula.service';
import { NotificationService } from '../../core/services/notification.service';

/**
 * Pruebas del listado de películas.
 * Se inyecta un mock de `PeliculaService` para aislar la vista del backend.
 */
describe('PeliculasListComponent', () => {
  let fixture: ComponentFixture<PeliculasListComponent>;
  let serviceMock: {
    getPeliculas: jasmine.Spy;
  };

  beforeEach(async () => {
    serviceMock = {
      getPeliculas: jasmine.createSpy('getPeliculas').and.returnValue(
        of({
          content: [{ id: 1, titulo: 'Matrix', anio: 1999, genero: 'Sci-Fi', director: 'Wachowski' }],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          size: 5,
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [PeliculasListComponent, NoopAnimationsModule],
      providers: [
        { provide: PeliculaService, useValue: serviceMock },
        { provide: NotificationService, useValue: { error: jasmine.createSpy(), success: jasmine.createSpy(), info: jasmine.createSpy() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PeliculasListComponent);
    fixture.detectChanges();
  });

  it('debería cargar las películas al inicializar', () => {
    expect(serviceMock.getPeliculas).toHaveBeenCalled();
    expect(fixture.componentInstance.peliculas().length).toBe(1);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('debería exponer las columnas esperadas de la tabla', () => {
    const keys = fixture.componentInstance.columns.map((column) => column.key);
    expect(keys).toEqual(['titulo', 'anio', 'genero', 'director']);
  });

  it('debería convertir la fila genérica de la tabla en una Pelicula tipada', () => {
    const componente = fixture.componentInstance;
    const fila = { id: 1, titulo: 'Matrix' };
    expect(componente.asPelicula(fila).titulo).toBe('Matrix');
  });

  it('debería reiniciar la página y recargar al cambiar el filtro', () => {
    serviceMock.getPeliculas.calls.reset();

    fixture.componentInstance.onFiltroChange('matrix');

    expect(fixture.componentInstance.pageIndex()).toBe(0);
    expect(fixture.componentInstance.titulo()).toBe('matrix');
    expect(serviceMock.getPeliculas).toHaveBeenCalledWith(0, 5, 'matrix');
  });

  it('debería mostrar un error y limpiar la tabla si la petición falla', () => {
    serviceMock.getPeliculas.and.returnValue(
      throwError(() => ({ status: 500, message: 'El servidor presentó un error.' })),
    );

    fixture.componentInstance.cargar();

    expect(fixture.componentInstance.error()).toContain('error');
    expect(fixture.componentInstance.peliculas().length).toBe(0);
    expect(fixture.componentInstance.loading()).toBe(false);
  });
});
