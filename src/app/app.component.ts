import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LoadingService } from './core/services/loading.service';
import { environment } from '../environments/environment';

/**
 * Componente raíz (shell de la aplicación).
 *
 * Contiene la barra superior, la barra de progreso global enganchada al estado
 * reactivo de `LoadingService` y el `router-outlet` donde se montan las features
 * cargadas de forma diferida.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <mat-icon aria-hidden="true">movie_filter</mat-icon>
      <span class="app-title">Centro de Consulta</span>
      <span class="spacer"></span>

      <span class="env-badge hide-xs" [matTooltip]="'Ambiente: ' + envName">
        {{ envName }}
      </span>
    </mat-toolbar>

    <!-- Feedback global de carga: se activa con cualquier petición HTTP en vuelo -->
    @if (isLoading()) {
      <mat-progress-bar mode="indeterminate" aria-label="Cargando contenido" />
    }

    <main class="app-content">
      <router-outlet />
    </main>

    <footer class="app-footer">
      <span>Prueba técnica · Angular + Angular Material</span>
    </footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .app-toolbar {
        position: sticky;
        top: 0;
        z-index: 10;
        gap: 0.5rem;
        box-shadow: var(--mat-sys-level2);
      }

      .app-title {
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .env-badge {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        background: color-mix(in srgb, currentColor 22%, transparent);
      }

      .app-content {
        flex: 1 1 auto;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
        box-sizing: border-box;
      }

      .app-footer {
        padding: 1rem;
        text-align: center;
        font-size: 0.75rem;
        color: var(--mat-sys-on-surface-variant);
      }

      @media (min-width: 768px) {
        .app-content {
          padding: 1.5rem 1.5rem 2rem;
        }
      }
    `,
  ],
})
export class AppComponent {
  private readonly loadingService = inject(LoadingService);

  /** Estado global de carga (signal). */
  readonly isLoading = this.loadingService.isLoading;

  /** Nombre del ambiente activo, útil para verificar despliegues. */
  readonly envName = environment.production ? 'producción' : 'desarrollo';
}
