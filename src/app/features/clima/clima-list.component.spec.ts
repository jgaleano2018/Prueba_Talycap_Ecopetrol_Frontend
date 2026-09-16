import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ClimaListComponent } from './clima-list.component';
import { ClimaService } from '../../core/services/clima.service';
import { NotificationService } from '../../core/services/notification.service';

/**
 * Pruebas del listado de clima: carga inicial, formato de temperatura y
 * clasificación por color según el valor.
 */
describe('ClimaListComponent', () => {
  let fixture: ComponentFixture<ClimaListComponent>;
  let serviceMock: { getCiudades: jasmine.Spy };

  beforeEach(async () => {
    serviceMock = {
      getCiudades: jasmine.createSpy('getCiudades').and.returnValue(
        of({
          content: [{ id: 1, ciudad: 'Bogotá', pais: 'Colombia', temperatura: 14, humedad: 80 }],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          size: 5,
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [ClimaListComponent, NoopAnimationsModule],
      providers: [
        { provide: ClimaService, useValue: serviceMock },
        { provide: NotificationService, useValue: { error: jasmine.createSpy(), success: jasmine.createSpy(), info: jasmine.createSpy() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClimaListComponent);
    fixture.detectChanges();
  });

  it('debería cargar los registros de clima al inicializar', () => {
    expect(serviceMock.getCiudades).toHaveBeenCalled();
    expect(fixture.componentInstance.ciudades().length).toBe(1);
  });

  it('debería formatear la temperatura con el símbolo de grado', () => {
    expect(fixture.componentInstance.formatTemperatura(14)).toBe('14°');
    expect(fixture.componentInstance.formatTemperatura(null)).toBe('—');
  });

  it('debería clasificar la temperatura para aplicar estilos dinámicos', () => {
    const componente = fixture.componentInstance;
    expect(componente.temperatureClass(10)).toBe('temp-frio');
    expect(componente.temperatureClass(22)).toBe('temp-templado');
    expect(componente.temperatureClass(35)).toBe('temp-calido');
    expect(componente.temperatureClass('N/D')).toBe('');
  });

  it('debería recargar al cambiar el filtro de ciudad', () => {
    serviceMock.getCiudades.calls.reset();

    fixture.componentInstance.onFiltroChange('bogotá');

    expect(serviceMock.getCiudades).toHaveBeenCalledWith(0, 5, 'bogotá');
    expect(fixture.componentInstance.ciudad()).toBe('bogotá');
  });
});
