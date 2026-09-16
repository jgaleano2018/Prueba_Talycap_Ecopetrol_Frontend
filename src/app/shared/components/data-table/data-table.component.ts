import { ChangeDetectionStrategy, Component, TemplateRef, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Definición de una columna de la tabla compartida.
 * El contenido se proyecta mediante `ng-template` desde la feature,
 * de forma que este componente no conoce los modelos de dominio.
 */
export interface TableColumn {
  /** Nombre de la columna: coincide con el `key` del template proyectado. */
  readonly key: string;
  /** Etiqueta visible en el encabezado. */
  readonly header: string;
  /** Clase CSS opcional para la columna (por ejemplo `hide-xs`). */
  readonly cssClass?: string;
}

/**
 * Tabla paginada reutilizable basada en Angular Material.
 *
 * Responsabilidad única: presentar las filas y emitir eventos de paginación y
 * de acción "ver". El filtrado y la carga de datos viven en cada feature.
 *
 * Uso:
 * ```html
 * <app-data-table
 *   [columns]="columns()"
 *   [rows]="items()"
 *   [totalElements]="total()"
 *   [pageSize]="pageSize()"
 *   [pageIndex]="pageIndex()"
 *   [loading]="loading()"
 *   (pageChange)="onPageChange($event)"
 *   (view)="openDetail($event)"
 * >
 *   <ng-template #cellTemplates let-row>
 *     <ng-container *ngTemplateOutlet="cellTemplates.titulo; context: { $implicit: row }" />
 *   </ng-template>
 * </app-data-table>
 * ```
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="rows()" class="data-table">
        @for (column of columns(); track column.key) {
          <ng-container [matColumnDef]="column.key">
            <th mat-header-cell *matHeaderCellDef [class]="column.cssClass ?? ''">
              {{ column.header }}
            </th>
            <td mat-cell *matCellDef="let row; let i = index" [class]="column.cssClass ?? ''">
              <!-- El contenido de cada celda lo define la feature mediante templates -->
              <ng-container
                [ngTemplateOutlet]="templateFor(column.key)"
                [ngTemplateOutletContext]="{ $implicit: row, index: i }"
              />
            </td>
          </ng-container>
        }

        <!-- Columna fija de acciones -->
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef class="actions-header">Acciones</th>
          <td mat-cell *matCellDef="let row" class="actions-cell">
            <button
              mat-stroked-button
              color="primary"
              type="button"
              (click)="view.emit(row)"
              [attr.aria-label]="'Ver detalle de la fila ' + row.id"
            >
              <mat-icon aria-hidden="true">visibility</mat-icon>
              <span class="hide-xs">Ver</span>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns(); sticky: true"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      </table>

      @if (loading()) {
        <div class="loading-overlay" role="status" aria-live="polite">
          <mat-spinner diameter="36" />
          <span>Cargando información…</span>
        </div>
      }

      @if (!loading() && rows().length === 0) {
        <p class="empty-state">No se encontraron resultados para los criterios ingresados.</p>
      }
    </div>

    <mat-paginator
      [length]="totalElements()"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      [pageSizeOptions]="pageSizeOptions()"
      [showFirstLastButtons]="true"
      (page)="onPageChange($event)"
      aria-label="Paginación de resultados"
    />
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .data-table {
        width: 100%;
      }

      .actions-header,
      .actions-cell {
        width: 1%;
        white-space: nowrap;
        text-align: right;
      }

      .loading-overlay {
        position: absolute;
        inset: 0;
        background: color-mix(in srgb, var(--mat-sys-surface) 78%, transparent);
        backdrop-filter: blur(1px);
      }

      mat-paginator {
        border-top: 1px solid var(--mat-sys-outline-variant);
      }
    `,
  ],
})
export class DataTableComponent {
  /** Columnas a mostrar (sin incluir la de acciones, que se agrega sola). */
  readonly columns = input.required<readonly TableColumn[]>();
  /** Filas de la página actual. */
  readonly rows = input.required<readonly { id: string | number }[]>();
  /** Total de elementos en el backend (para el paginador). */
  readonly totalElements = input<number>(0);
  /** Tamaño de página actual. */
  readonly pageSize = input<number>(5);
  /** Índice de página actual (0-based). */
  readonly pageIndex = input<number>(0);
  /** Indicador de carga. */
  readonly loading = input<boolean>(false);
  /** Opciones de tamaño de página del paginador. */
  readonly pageSizeOptions = input<readonly number[]>([5, 10, 25, 50]);
  /** Templates de celda proyectados por la feature, indexados por nombre de columna. */
  readonly cellTemplates = input<Readonly<Record<string, TemplateRef<unknown>>>>({});

  /** Emite el cambio de página/size solicitado por el usuario. */
  readonly pageChange = output<PageEvent>();
  /** Emite la fila seleccionada al presionar "Ver". */
  readonly view = output<{ id: string | number }>();

  /** Columnas efectivamente renderizadas: las declaradas + `acciones`. */
  displayedColumns(): string[] {
    return [...this.columns().map((column) => column.key), 'acciones'];
  }

  /** Devuelve el template de celda registrado para una columna. */
  templateFor(key: string): TemplateRef<unknown> | null {
    return (this.cellTemplates()[key] as TemplateRef<unknown> | undefined) ?? null;
  }

  /** Reemite el evento del paginador. */
  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}
