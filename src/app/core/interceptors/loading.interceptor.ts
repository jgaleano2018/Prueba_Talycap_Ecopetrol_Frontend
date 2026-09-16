import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';

/**
 * Interceptor de carga.
 *
 * Marca el inicio y el fin de cada petición HTTP en el `LoadingService`.
 * El uso de `finalize` garantiza que el contador se libera tanto en éxito
 * como en error, evitando que el spinner quede bloqueado indefinidamente.
 */
export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loadingService = inject(LoadingService);

  loadingService.start();

  return next(request).pipe(finalize(() => loadingService.stop()));
};
