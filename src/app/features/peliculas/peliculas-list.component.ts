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

import { ApiError } from '../../core/models/page.model';
import { Pelicula } from '../../core/models/pelicula.model';
import { NotificationService } from '../../core/services/notification.service';
import { PeliculaService } from '../../core/services/pelicula.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import {
  DetailDialogComponent,
  DetailField,
} from '../../shared/components/detail-dialog/detail-dialog.component';

/** Columnas visibles de la tabla de películas (la columna "acciones" la agrega la tabla). */
const COLUMNS: readonly TableColumn[] = [
  { key: 'titulo', header: 'Título' },
  { key: 'anio', header: 'Año', cssClass: 'hide-xs' },
  { key: 'genero', header: 'Género', cssClass: 'hide-xs' },
  { key: 'director', header: 'Director', cssClass: 'hide-md' },
];

/**
 * Listado de películas.
 *
 * Consume `PeliculaService` y mantiene el estado de la vista con `signals`:
 * filas, paginación, filtro y carga. Toda la presentación de la tabla y del
 * detalle se delega en los componentes compartidos (`DataTableComponent`,
 * `DetailDialogComponent`), por lo que este componente solo orquesta datos.
 */
@Component({
  selector: 'app-peliculas-list',
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
    <section class="feature peliculas">
      <header class="feature-header">
        <div>
          <h2>Películas</h2>
          <p class="feature-subtitle">Consulta el catálogo y abre el detalle de cada registro.</p>
        </div>

        <!-- Filtro por título -->
        <mat-form-field appearance="outline" class="filter-field" subscriptSizing="dynamic">
          <mat-label>Buscar por título</mat-label>
          <mat-icon matPrefix aria-hidden="true">search</mat-icon>
          <input
            matInput
            type="search"
            [ngModel]="titulo()"
            (ngModelChange)="onFiltroChange($event)"
            placeholder="Ej. Matrix"
            aria-label="Filtrar películas por título"
          />
          @if (titulo()) {
            <button matSuffix mat-icon-button type="button" aria-label="Limpiar filtro" (click)="onFiltroChange('')">
              <mat-icon aria-hidden="true">close</mat-icon>
            </button>
          }
        </mat-form-field>
      </header>

      <!-- Error de la última petición -->
      @if (error()) {
        <div class="error-banner" role="alert">
          <mat-icon aria-hidden="true">error_outline</mat-icon>
          <span>{{ error() }}</span>
          <button mat-stroked-button color="primary" type="button" (click)="cargar()">Reintentar</button>
        </div>
      }

      <app-data-table
        [columns]="columns"
        [rows]="peliculas()"
        [totalElements]="total()"
        [pageSize]="pageSize()"
        [pageIndex]="pageIndex()"
        [loading]="loading()"
        [cellTemplates]="{
          titulo: tituloTpl,
          anio: anioTpl,
          genero: generoTpl,
          director: directorTpl
        }"
        (pageChange)="onPageChange($event)"
        (view)="openDetail($event)"
      />

      <!-- Templates de celdas referenciados para la tabla -->
      <ng-template #tituloTpl let-row>
        <strong>{{ asPelicula(row).titulo }}</strong>
      </ng-template>

      <ng-template #anioTpl let-row>
        {{ asPelicula(row).anio ?? '—' }}
      </ng-template>

      <ng-template #generoTpl let-row>
        {{ asPelicula(row).genero || '—' }}
      </ng-template>

      <ng-template #directorTpl let-row>
        {{ asPelicula(row).director || '—' }}
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

      /* Dos columnas a partir de tablet */
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
export class PeliculasListComponent implements OnInit {
  private readonly peliculaService = inject(PeliculaService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  /** Referencias a los templates de celda */
  @ViewChild('tituloTpl', { static: true }) tituloTpl!: TemplateRef<unknown>;
  @ViewChild('anioTpl', { static: true }) anioTpl!: TemplateRef<unknown>;
  @ViewChild('generoTpl', { static: true }) generoTpl!: TemplateRef<unknown>;
  @ViewChild('directorTpl', { static: true }) directorTpl!: TemplateRef<unknown>;

  /** Columnas declarativas de la tabla. */
  readonly columns = COLUMNS;

  /** Estado de la vista basado en signals. */
  private readonly peliculasState = signal<readonly Pelicula[]>([]);
  private readonly totalState = signal(0);
  private readonly pageIndexState = signal(0);
  private readonly pageSizeState = signal(5);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly tituloState = signal('');

  readonly peliculas = computed(() => this.peliculasState());
  readonly total = computed(() => this.totalState());
  readonly pageIndex = computed(() => this.pageIndexState());
  readonly pageSize = computed(() => this.pageSizeState());
  readonly loading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());
  readonly titulo = computed(() => this.tituloState());

  ngOnInit(): void {
    this.cargar();
  }

  /**
   * Actualiza el filtro y vuelve a la primera página.
   * El backend recibe el parámetro `titulo`; si no lo soporta, el servicio
   * devuelve la colección normalizada y la búsqueda se aplica en cliente.
   */
  onFiltroChange(value: string): void {
    this.tituloState.set(value ?? '');
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

    this.peliculaService
      .getPeliculas(this.pageIndexState(), this.pageSizeState(), this.tituloState() || undefined)
      .pipe(
        catchError((error: ApiError) => {
          this.errorState.set(error?.message ?? 'No fue posible cargar las películas.');
          this.notification.error(error?.message ?? 'No fue posible cargar las películas.');
          return of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: this.pageSizeState() });
        }),
        finalize(() => this.loadingState.set(false)),
      )
      .subscribe((page) => {
        // Filtrado defensivo en cliente cuando el backend ignora el parámetro.
        const termino = this.tituloState().trim().toLowerCase();
        const filas = termino
          ? page.content.filter((p) => p.titulo.toLowerCase().includes(termino))
          : page.content;

        this.peliculasState.set(filas);
        this.totalState.set(termino ? filas.length : page.totalElements);
      });
  }

  /** Abre el diálogo de detalle con los campos formateados de la película. */
  openDetail(row: { id: string | number }): void {
    const pelicula = row as Pelicula;

    this.dialog.open(DetailDialogComponent, {
      data: {
        title: pelicula.titulo,
        subtitle: pelicula.anio ? `Año ${pelicula.anio}` : undefined,
        icon: 'movie',
        fields: this.buildFields(pelicula),
      },
      autoFocus: false,
      maxWidth: '90vw',
    });
  }

  /** Convierte la fila genérica de la tabla a `Pelicula` conservando el tipado. */
  asPelicula(row: unknown): Pelicula {
    return row as Pelicula;
  }

  /** Prepara los campos que verá el usuario en el popup de detalle. */
  private buildFields(pelicula: Pelicula): readonly DetailField[] {
    return [
      { label: 'Título', value: pelicula.titulo },
      { label: 'Año', value: this.format(pelicula.anio) },
      { label: 'Género', value: this.format(pelicula.genero) },
      { label: 'Director', value: this.format(pelicula.director) },
      { label: 'Duración', value: pelicula.duracion ? `${pelicula.duracion} min` : '—' },
      { label: 'Estudio', value: this.format(pelicula.estudio) },
      { label: 'Sinopsis', value: this.format(pelicula.sinopsis) },
    ];
  }

  /** Normaliza un valor opcional a texto mostrable. */
  private format(value: unknown): string {
    return value === undefined || value === null || value === '' ? '—' : String(value);
  }
}