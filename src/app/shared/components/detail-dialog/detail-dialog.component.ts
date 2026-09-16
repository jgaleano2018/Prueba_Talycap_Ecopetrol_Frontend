import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

/** Fila clave/valor ya preparada para renderizar. */
export interface DetailField {
  readonly label: string;
  readonly value: string;
}

/** Datos inyectados al diálogo por la feature que lo abre. */
export interface DetailDialogData {
  readonly title: string;
  readonly subtitle?: string;
  readonly icon?: string;
  readonly fields: readonly DetailField[];
}

/**
 * Diálogo reutilizable de detalle.
 *
 * Recibe una lista de campos ya formateados por la feature (película o clima),
 * de modo que el componente compartido no conoce ningún modelo de dominio.
 */
@Component({
  selector: 'app-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule],
  template: `
    <h2 mat-dialog-title class="detail-title">
      @if (data.icon) {
        <mat-icon aria-hidden="true">{{ data.icon }}</mat-icon>
      }
      <span>{{ data.title }}</span>
    </h2>

    @if (data.subtitle) {
      <p class="detail-subtitle">{{ data.subtitle }}</p>
    }

    <mat-divider />

    <mat-dialog-content class="detail-content">
      @if (data.fields.length === 0) {
        <p class="empty-state">No hay información adicional para mostrar.</p>
      } @else {
        <dl class="detail-grid">
          @for (field of data.fields; track field.label) {
            <div class="detail-item">
              <dt>{{ field.label }}</dt>
              <dd>{{ field.value }}</dd>
            </div>
          }
        </dl>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" [mat-dialog-close]="true">Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .detail-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
      }

      .detail-subtitle {
        margin: 0 24px 0.5rem;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.875rem;
      }

      .detail-content {
        min-width: min(520px, 78vw);
        max-height: 60vh;
        padding-top: 1rem;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
        margin: 0;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      dt {
        font-size: 0.75rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--mat-sys-on-surface-variant);
      }

      dd {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.4;
        word-break: break-word;
      }

      /* Dos columnas en pantallas medianas o superiores */
      @media (min-width: 600px) {
        .detail-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `,
  ],
})
export class DetailDialogComponent {
  /** Datos recibidos desde la feature. */
  readonly data = inject<DetailDialogData>(MAT_DIALOG_DATA);
  /** Referencia al diálogo (el botón cerrar usa `[mat-dialog-close]`). */
  readonly dialogRef = inject(MatDialogRef<DetailDialogComponent>);
}
