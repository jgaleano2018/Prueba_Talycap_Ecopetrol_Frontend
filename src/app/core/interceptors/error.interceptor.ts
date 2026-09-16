import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ApiError } from '../models/page.model';

/**
 * Interceptor de errores HTTP.
 *
 * Normaliza cualquier fallo (`HttpErrorResponse`, error de red, timeout) a un
 * objeto `ApiError` con un mensaje apto para el usuario final, de modo que los
 * componentes no tengan que interpretar códigos HTTP.
 */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const isMockApi = false;

  return next(request).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error, isMockApi);
      // El detalle técnico queda en consola para depuración, no en la UI.
      console.error(`[HTTP ${apiError.status}] ${request.method} ${request.url}`, error);
      return throwError(() => apiError);
    }),
  );
};

/** Traduce cualquier error de Angular en un `ApiError` legible. */
export function toApiError(error: unknown, _isMockApi = false): ApiError {
  if (error instanceof HttpErrorResponse) {
    // status 0 => error de red, CORS o backend apagado.
    if (error.status === 0) {
      return {
        status: 0,
        message:
          'No fue posible conectar con el servidor. Verifica que la API esté disponible e intenta de nuevo.',
        detail: error.message,
      };
    }

    return {
      status: error.status,
      message: humanizeHttpMessage(error),
      detail: extractDetail(error),
    };
  }

  return {
    status: -1,
    message: 'Ocurrió un error inesperado al procesar la solicitud.',
    detail: error instanceof Error ? error.message : String(error),
  };
}

/** Mensaje en español según el código HTTP. */
function humanizeHttpMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400:
      return 'La solicitud no es válida. Revisa los datos enviados.';
    case 401:
      return 'No estás autorizado para consultar esta información.';
    case 403:
      return 'No tienes permisos para acceder a este recurso.';
    case 404:
      return 'El recurso solicitado no existe en el servidor.';
    case 408:
      return 'El servidor tardó demasiado en responder. Intenta nuevamente.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'El servidor presentó un error. Intenta nuevamente en unos minutos.';
    default:
      return `Error del servidor (HTTP ${error.status}).`;
  }
}

/** Extrae el mensaje del cuerpo de error si el backend lo provee. */
function extractDetail(error: HttpErrorResponse): string | undefined {
  const body = error.error as { message?: string; error?: string } | string | null;
  if (typeof body === 'string') {
    return body;
  }
  if (body && typeof body === 'object') {
    return body.message ?? body.error ?? error.message;
  }
  return error.message;
}
