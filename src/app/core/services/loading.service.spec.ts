import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

/**
 * Pruebas del estado global de carga.
 * El objetivo es garantizar que peticiones concurrentes no oculten el spinner
 * hasta que todas finalicen.
 */
describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('debería iniciar con el estado de carga en falso', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('debería activar isLoading al iniciar una petición', () => {
    service.start();
    expect(service.isLoading()).toBe(true);
  });

  it('debería mantenerse activo con peticiones concurrentes y apagarse al terminar todas', () => {
    service.start();
    service.start();

    service.stop();
    expect(service.isLoading()).toBe(true);

    service.stop();
    expect(service.isLoading()).toBe(false);
  });

  it('no debería bajar de cero ante un stop extra', () => {
    service.stop();
    expect(service.isLoading()).toBe(false);
  });

  it('debería reiniciar el contador con reset()', () => {
    service.start();
    service.start();

    service.reset();
    expect(service.isLoading()).toBe(false);
  });
});
