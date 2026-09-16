import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { PeliculasListComponent } from './peliculas/peliculas-list.component';
import { ClimaListComponent } from './clima/clima-list.component';

/**
 * Página Home.
 *
 * Ofrece un toggle de Angular Material (`MatTabGroup`) para alternar entre los
 * componentes de películas y clima. Los componentes de cada feature se cargan
 * en el tab correspondiente y gestionan su propio estado reactivo.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabsModule, MatIconModule, PeliculasListComponent, ClimaListComponent],
  template: `
    <section class="home">
      <header class="home-header">
        <h1>Consulta de Películas y Clima</h1>
        <p>
          Consulta los resultados de cada servicio, filtra por nombre y abre el detalle completo de
          cada registro.
        </p>
      </header>

      <!-- Toggle principal entre las dos features -->
      <mat-tab-group
        class="feature-tabs"
        dynamicHeight
        animationDuration="250ms"
        preserveContent
        mat-stretch-tabs="true"
      >
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon" aria-hidden="true">movie</mat-icon>
            <span>Películas</span>
          </ng-template>
          <div class="tab-panel">
            <app-peliculas-list />
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon" aria-hidden="true">cloud</mat-icon>
            <span>Clima</span>
          </ng-template>
          <div class="tab-panel">
            <app-clima-list />
          </div>
        </mat-tab>
      </mat-tab-group>
    </section>
  `,
  styles: [
    `
      .home {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .home-header h1 {
        margin: 0 0 0.35rem;
        font-size: clamp(1.35rem, 3.5vw, 2rem);
        line-height: 1.2;
      }

      .home-header p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
        max-width: 65ch;
      }

      .feature-tabs {
        background: var(--mat-sys-surface-container-lowest);
        border-radius: 16px;
        box-shadow: var(--mat-sys-level1);
        overflow: hidden;
      }

      .tab-icon {
        margin-right: 0.4rem;
      }

      .tab-panel {
        padding: 1rem;
      }

      @media (min-width: 768px) {
        .tab-panel {
          padding: 1.5rem;
        }
      }
    `,
  ],
})
export class HomeComponent { }
