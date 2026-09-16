import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** Página 404 mostrada cuando ninguna ruta coincide. */
@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <section class="not-found">
      <mat-icon aria-hidden="true">search_off</mat-icon>
      <h1>404</h1>
      <p>La página que buscas no existe o fue movida.</p>
      <a mat-flat-button color="primary" routerLink="/home">
        <mat-icon aria-hidden="true">home</mat-icon>
        Volver al inicio
      </a>
    </section>
  `,
  styles: [
    `
      .not-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 4rem 1rem;
        text-align: center;
      }

      mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        color: var(--mat-sys-primary);
      }

      h1 {
        margin: 0;
        font-size: 2.5rem;
      }

      p {
        margin: 0 0 1rem;
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class NotFoundComponent { }
