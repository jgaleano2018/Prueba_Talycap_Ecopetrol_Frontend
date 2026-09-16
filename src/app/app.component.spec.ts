import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LoadingService } from './core/services/loading.service';

/**
 * Pruebas del shell de la aplicación: barra de progreso ligada al
 * `LoadingService` y presencia del `router-outlet`.
 */
describe('AppComponent', () => {
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    loadingService = TestBed.inject(LoadingService);
  });

  it('debería crearse correctamente', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no debería mostrar la barra de progreso cuando no hay peticiones en vuelo', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeNull();
  });

  it('debería mostrar la barra de progreso al activarse el estado de carga', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    loadingService.start();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeTruthy();
  });
});
