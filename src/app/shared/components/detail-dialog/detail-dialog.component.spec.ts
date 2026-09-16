import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DetailDialogComponent, DetailDialogData } from './detail-dialog.component';

/**
 * Pruebas del popup de detalle: se valida que los campos inyectados por la
 * feature se rendericen y que el componente maneje el caso sin información.
 */
describe('DetailDialogComponent', () => {
  const dataConCampos: DetailDialogData = {
    title: 'Matrix',
    subtitle: 'Año 1999',
    icon: 'movie',
    fields: [
      { label: 'Director', value: 'Lana Wachowski' },
      { label: 'Género', value: 'Sci-Fi' },
    ],
  };

  async function crear(data: DetailDialogData) {
    await TestBed.configureTestingModule({
      imports: [DetailDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        // El componente inyecta MatDialogRef (solo disponible dentro de un diálogo real).
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DetailDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('debería mostrar el título y el subtítulo recibidos', async () => {
    const fixture = await crear(dataConCampos);
    const titulo = fixture.nativeElement.querySelector('.detail-title');
    const subtitulo = fixture.nativeElement.querySelector('.detail-subtitle');

    expect(titulo.textContent).toContain('Matrix');
    expect(subtitulo.textContent).toContain('Año 1999');
  });

  it('debería renderizar cada campo como una fila clave/valor', async () => {
    const fixture = await crear(dataConCampos);
    const items = fixture.nativeElement.querySelectorAll('.detail-item');

    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Director');
    expect(items[0].textContent).toContain('Lana Wachowski');
  });

  it('debería mostrar un mensaje cuando no hay campos', async () => {
    const fixture = await crear({ title: 'Sin datos', fields: [] });
    const vacio = fixture.nativeElement.querySelector('.empty-state');

    expect(vacio).toBeTruthy();
  });
});
