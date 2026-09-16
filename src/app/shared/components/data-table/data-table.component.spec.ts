import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PageEvent } from '@angular/material/paginator';

import { DataTableComponent, TableColumn } from './data-table.component';

/**
 * Pruebas del componente compartido de tabla: renderizado de columnas,
 * emisión de eventos de paginación y de detalle.
 */
describe('DataTableComponent', () => {
  let fixture: ComponentFixture<DataTableComponent>;
  let component: DataTableComponent;

  const columns: TableColumn[] = [
    { key: 'titulo', header: 'Título' },
    { key: 'anio', header: 'Año' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', [{ id: 1, titulo: 'Matrix' }]);
    fixture.componentRef.setInput('totalElements', 1);
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería agregar la columna de acciones a las columnas declaradas', () => {
    expect(component.displayedColumns()).toEqual(['titulo', 'anio', 'acciones']);
  });

  it('debería renderizar el encabezado de cada columna', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    const texto = Array.from(headers).map((th) => (th as HTMLElement).textContent?.trim());
    expect(texto).toContain('Título');
    expect(texto).toContain('Año');
  });

  it('debería emitir el evento de paginación al cambiar de página', () => {
    let emitido: PageEvent | undefined;
    component.pageChange.subscribe((event) => (emitido = event));

    const event = { pageIndex: 2, pageSize: 10, length: 100 } as PageEvent;
    component.onPageChange(event);

    expect(emitido).toEqual(event);
  });

  it('debería emitir la fila seleccionada al solicitar el detalle', () => {
    let emitido: { id: string | number } | undefined;
    component.view.subscribe((row) => (emitido = row));

    const boton: HTMLButtonElement = fixture.nativeElement.querySelector('.actions-cell button');
    boton.click();

    // El evento emite la misma instancia de la fila suministrada como input.
    expect(emitido).toBe(component.rows()[0]);
    expect(emitido?.id).toBe(1);
  });

  it('debería mostrar el estado vacío cuando no hay filas y no está cargando', () => {
    fixture.componentRef.setInput('rows', []);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const vacio = fixture.nativeElement.querySelector('.empty-state');
    expect(vacio).toBeTruthy();
  });
});
