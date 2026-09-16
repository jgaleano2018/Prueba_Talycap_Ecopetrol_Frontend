import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * Servicio centralizado de notificaciones (snackbar de Angular Material).
 * Evita repetir configuración y textos en cada componente.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly baseConfig: MatSnackBarConfig = {
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
    duration: 4500,
  };

  /** Notifica un error al usuario (barra roja, sin autocierre). */
  error(message: string, action = 'Cerrar'): void {
    this.snackBar.open(message, action, {
      ...this.baseConfig,
      duration: 7000,
      panelClass: 'snackbar-error',
    });
  }

  /** Notifica éxito (actualización de datos, copia, etc.). */
  success(message: string, action = 'OK'): void {
    this.snackBar.open(message, action, {
      ...this.baseConfig,
      panelClass: 'snackbar-success',
    });
  }

  /** Notifica información neutral. */
  info(message: string, action = 'OK'): void {
    this.snackBar.open(message, action, { ...this.baseConfig, panelClass: 'snackbar-info' });
  }
}
