import { Injectable, signal, computed } from '@angular/core';

/**
 * Estado global de carga.
 *
 * Los interceptores incrementan/decrementan un contador para soportar
 * peticiones concurrentes: el spinner se oculta solo cuando todas terminan.
 * Se expone como `signal` para integrarse con el modelo reactivo de Angular.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);

  /** `true` mientras exista al menos una petición HTTP en vuelo. */
  readonly isLoading = computed(() => this.activeRequests() > 0);

  /** Registra el inicio de una petición. */
  start(): void {
    this.activeRequests.update((count) => count + 1);
  }

  /** Registra la finalización (exitosa o fallida) de una petición. */
  stop(): void {
    this.activeRequests.update((count) => Math.max(0, count - 1));
  }

  /** Reinicia el contador (útil en pruebas o al cambiar de vista). */
  reset(): void {
    this.activeRequests.set(0);
  }
}
