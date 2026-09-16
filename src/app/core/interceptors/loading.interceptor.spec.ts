import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

/**
 * Pruebas del interceptor de carga: el contador global debe incrementarse
 * durante la petición y liberarse al finalizar (éxito o error).
 */
describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpMock.verify();
    loadingService.reset();
  });

  it('debería activar el estado de carga mientras la petición está en vuelo', () => {
    http.get('/test').subscribe();

    expect(loadingService.isLoading()).toBe(true);

    httpMock.expectOne('/test').flush({});

    expect(loadingService.isLoading()).toBe(false);
  });

  it('debería liberar el contador aunque la petición falle', () => {
    http.get('/test').subscribe({ error: () => undefined });

    httpMock.expectOne('/test').error(new ErrorEvent('network error'));

    expect(loadingService.isLoading()).toBe(false);
  });
});
