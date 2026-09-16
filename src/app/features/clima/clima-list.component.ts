import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageEvent } from '@angular/material/paginator';
import { catchError, finalize, of } from 'rxjs';

import { CiudadClima } from '../../core/models/ciudad-clima.model';
import { ApiError } from '../../core/models/page.model';
import { ClimaService } from '../../core/services/clima.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import {
  DetailDialogComponent,
  DetailField,
} from '../../shared/components/detail-dialog/detail-dialog.component';

/** Columnas visibles de la tabla de clima. */
const COLUMNS: readonly TableColumn[] = [
  { key: 'ciudad', header: 'Ciudad' },
  { key: 'pais', header: 'País', cssClass: 'hide-xs' },
  { key: 'temperatura', header: 'Temp.', cssClass: 'hide-xs' },
  { key: 'descripcion', header: 'Condición', cssClass: 'hide-md' },
];

/**
 * Listado de clima por ciudad.
 *
 * Mismo patrón que la feature de películas: `signals` para el estado de la
 * vista, tabla y diálogo compartidos. La temperatura se muestra con un color
 * dinámico según su valor (estilo calculado en el template).
 */
@Component({
  selector: 'app-clima-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DataTableComponent,
  ],
  template: `
    <section class="feature clima">
      <header class="feature-header">
        <div>
          <h2>Clima</h2>
          <p class="feature-subtitle">Consulta las condiciones actuales por ciudad.</p>
        </div>

        <!-- Filtro por ciudad -->
        <mat-form-field appearance="outline" class="filter-field" subscriptSizing="dynamic">
          <mat-label>Buscar por ciudad</mat-label>
          <mat-icon matPrefix aria-hidden="true">search</mat-icon>
          <input
            matInput
            type="search"
            [ngModel]="ciudad()"
            (ngModelChange)="onFiltroChange($event)"
            placeholder="Ej. Bogotá"
            aria-label="Filtrar registros de clima por ciudad"
          />
          @if (ciudad()) {
            <button matSuffix mat-icon-button type="button" aria-label="Limpiar filtro" (click)="onFiltroChange('')">
              <mat-icon aria-hidden="true">close</mat-icon>
            </button>
          }
        </mat-form-field>
      </header>

      @if (error()) {
        <div class="error-banner" role="alert">
          <mat-icon aria-hidden="true">error_outline</mat-icon>
          <span>{{ error() }}</span>
          <button mat-stroked-button color="primary" type="button" (click)="cargar()">Reintentar</button>
        </div>
      }

      <app-data-table
        [columns]="columns"
        [rows]="ciudades()"
        [totalElements]="total()"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex()"
        [loading]="loading()"
        [cellTemplates]="{
          ciudad: ciudadTpl,
          pais: paisTpl,
          temperatura: temperaturaTpl,
          descripcion: descripcionTpl
        }"
        (pageChange)="onPageChange($event)"
        (view)="openDetail($event)"
      />

      <!-- Templates de celdas referenciados para la tabla -->
      <ng-template #ciudadTpl let-item>
        <strong>{{ asCiudad(item).ciudad }}</strong>
      </ng-template>

      <ng-template #paisTpl let-item>
        {{ asCiudad(item).pais || '—' }}
      </ng-template>

      <ng-template #temperaturaTpl let-item>
        <span [class]="temperatureClass(asCiudad(item).temperatura)">
          {{ formatTemperatura(asCiudad(item).temperatura) }}
        </span>
      </ng-template>

      <ng-template #descripcionTpl let-item>
        {{ asCiudad(item).descripcion || '—' }}
      </ng-template>
    </section>
  `,
  styles: [
    `
      .feature {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .feature-header {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .feature-header h2 {
        margin: 0 0 0.25rem;
        font-size: clamp(1.15rem, 3vw, 1.5rem);
      }

      .feature-subtitle {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
      }

      .filter-field {
        width: 100%;
      }

      .error-banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        background: color-mix(in srgb, var(--mat-sys-error) 12%, transparent);
        color: var(--mat-sys-error);
      }

      .error-banner button {
        margin-left: auto;
      }

      /* Colores dinámicos según la temperatura (calculados en la clase) */
      .temp-frio {
        color: var(--mat-sys-primary);
        font-weight: 600;
      }

      .temp-templado {
        color: var(--mat-sys-tertiary);
        font-weight: 600;
      }

      .temp-calido {
        color: var(--mat-sys-error);
        font-weight: 600;
      }

      @media (min-width: 768px) {
        .feature-header {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .filter-field {
          max-width: 320px;
        }
      }
    `,
  ],
})
export class ClimaListComponent implements OnInit {
  private readonly climaService = inject(ClimaService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  /** Referencias a los templates de celda */
  @ViewChild('ciudadTpl', { static: true }) ciudadTpl!: TemplateRef<unknown>;
  @ViewChild('paisTpl', { static: true }) paisTpl!: TemplateRef<unknown>;
  @ViewChild('temperaturaTpl', { static: true }) temperaturaTpl!: TemplateRef<unknown>;
  @ViewChild('descripcionTpl', { static: true }) descripcionTpl!: TemplateRef<unknown>;

  /** Columnas declarativas de la tabla. */
  readonly columns = COLUMNS;

  /** Estado de la vista basado en signals. */
  private readonly ciudadesState = signal<readonly CiudadClima[]>([]);
  private readonly totalState = signal(0);
  private readonly pageIndexState = signal(0);
  private readonly pageSizeState = signal(5);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly ciudadState = signal('');

  readonly ciudades = computed(() => this.ciudadesState());
  readonly total = computed(() => this.totalState());
  readonly pageIndex = computed(() => this.pageIndexState());
  readonly pageSize = computed(() => this.pageSizeState());
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());
  readonly ciudad = computed(() => this.ciudadState());

  ngOnInit(): void {
    this.cargar();
  }

  /** Actualiza el filtro por ciudad y reinicia la paginación. */
  onFiltroChange(value: string): void {
    this.ciudadState.set(value ?? '');
    this.pageIndexState.set(0);
    this.cargar();
  }

  /** Maneja el cambio de página del paginador compartido. */
  onPageChange(event: PageEvent): void {
    this.pageIndexState.set(event.pageIndex);
    this.pageSizeState.set(event.pageSize);
    this.cargar();
  }

  /** Carga la página actual aplicando el filtro vigente. */
  cargar(): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.climaService
      .getCiudades(this.pageIndexState(), this.pageSizeState(), this.ciudadState() || undefined)
      .pipe(
        catchError((error: ApiError) => {
          this.errorState.set(error?.message ?? 'No fue posible cargar los datos de clima.');
          this.notification.error(error?.message ?? 'No fue posible cargar los datos de clima.');
          return of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: this.pageSizeState() });
        }),
        finalize(() => this.loadingState.set(false)),
      )
      .subscribe((page) => {
        const termino = this.ciudadState().trim().toLowerCase();
        const filas = termino
          ? page.content.filter((item) => item.ciudad.toLowerCase().includes(termino))
          : page.content;

        this.ciudadesState.set(filas);
        this.totalState.set(termino ? filas.length : page.totalElements);
      });
  }

  /** Abre el diálogo de detalle con los campos formateados. */
  openDetail(row: { id: string | number }): void {
    const item = row as CiudadClima;

    this.dialog.open(DetailDialogComponent, {
      data: {
        title: item.ciudad,
        subtitle: item.pais ?? undefined,
        icon: 'cloud',
        fields: this.buildFields(item),
      },
      autoFocus: false,
      maxWidth: '90vw',
    });
  }

  /** Convierte la fila genérica de la tabla a `CiudadClima`. */
  asCiudad(row: unknown): CiudadClima {
    return row as CiudadClima;
  }

  /** Formatea la temperatura añadiendo el grado. */
  formatTemperatura(value: unknown): string {
    return value === undefined || value === null || value === '' ? '—' : `${value}°`;
  }

  /**
   * Calcula la clase de color según la temperatura.
   * Si el valor no es numérico se devuelve una clase neutra.
   */
  temperatureClass(value: unknown): string {
    const temp = Number(value);
    if (!Number.isFinite(temp)) {
      return '';
    }
    if (temp < 15) {
      return 'temp-frio';
    }
    return temp <= 28 ? 'temp-templado' : 'temp-calido';
  }

  /** Prepara los campos que verá el usuario en el popup de detalle. */
  private buildFields(item: CiudadClima): readonly DetailField[] {
    return [
      { label: 'Ciudad', value: item.ciudad },
      { label: 'País', value: this.format(item.pais) },
      { label: 'Temperatura', value: this.formatTemperatura(item.temperatura) },
      { label: 'Humedad', value: item.humedad ? `${item.humedad}%` : '—' },
      { label: 'Condición', value: this.format(item.descripcion) },
      { label: 'Viento', value: this.format(item.viento) },
    ];
  }

  /** Normaliza un valor opcional a texto mostrable. */
  private format(value: unknown): string {
    return value === undefined || value === null || value === '' ? '—' : String(value);
  }
}