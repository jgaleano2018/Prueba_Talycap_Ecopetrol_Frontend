import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { errorInterceptor, toApiError } from './error.interceptor';
import { ApiError } from '../models/page.model';

/**
 * Pruebas del interceptor de errores.
 * Se valida que cualquier fallo HTTP se normalice a un `ApiError` con mensaje
 * apto para el usuario final.
 */
describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Se silencia la salida a consola que produce el interceptor durante las pruebas.
    console.error = () => undefined;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    console.error = originalConsoleError;
  });

  it('debería normalizar un 404 a un ApiError legible', () => {
    let error: ApiError | undefined;

    http.get('/test').subscribe({ error: (e: ApiError) => (error = e) });

    httpMock.expectOne('/test').flush({ message: 'no encontrado' }, { status: 404, statusText: 'Not Found' });

    expect(error?.status).toBe(404);
    expect(error?.message).toContain('no existe');
  });

  it('debería tratar el status 0 (error de red/CORS) con un mensaje específico', () => {
    let error: ApiError | undefined;

    http.get('/test').subscribe({ error: (e: ApiError) => (error = e) });

    httpMock.expectOne('/test').error(new ProgressEvent('error'));

    expect(error?.status).toBe(0);
    expect(error?.message).toContain('conectar con el servidor');
  });

  it('debería traducir un error no-HTTP a un ApiError genérico', () => {
    const apiError = toApiError(new Error('boom'));
    expect(apiError.status).toBe(-1);
    expect(apiError.detail).toBe('boom');
  });
});
