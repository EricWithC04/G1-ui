import { Component, computed, input, output } from '@angular/core';
import { PAGE_SIZE_OPTIONS, rangoPagina, totalPaginas } from '../../utils/paginar';

@Component({
  selector: 'app-admin-pagination',
  template: `
    @if (total() > 0) {
      <div class="admin-pagination">
        <span class="admin-pagination-info">
          Mostrando {{ rango().desde }}–{{ rango().hasta }} de {{ total() }}
        </span>
        <div class="admin-pagination-controls">
          <label class="admin-pagination-size">
            Por página
            <select
              class="admin-input admin-input--sm"
              [value]="tamano()"
              (change)="onTamanoChange($event)"
            >
              @for (n of opciones; track n) {
                <option [value]="n">{{ n }}</option>
              }
            </select>
          </label>
          <button
            type="button"
            class="admin-btn admin-btn-ghost admin-btn--sm"
            [disabled]="pagina() <= 1"
            (click)="paginaChange.emit(pagina() - 1)"
          >Anterior</button>
          <span class="admin-pagination-page">{{ pagina() }} / {{ paginas() }}</span>
          <button
            type="button"
            class="admin-btn admin-btn-ghost admin-btn--sm"
            [disabled]="pagina() >= paginas()"
            (click)="paginaChange.emit(pagina() + 1)"
          >Siguiente</button>
        </div>
      </div>
    }
  `,
  styles: `
    .admin-pagination {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      font-size: 0.8125rem;
      color: rgb(148 163 184);
    }
    .admin-pagination-controls { display: flex; align-items: center; gap: 0.5rem; }
    .admin-pagination-size { display: flex; align-items: center; gap: 0.35rem; }
    .admin-pagination-page { min-width: 4rem; text-align: center; color: rgb(226 232 240); }
    .admin-input--sm { padding: 0.25rem 0.5rem; font-size: 0.8125rem; }
    .admin-btn--sm { padding: 0.25rem 0.65rem; font-size: 0.8125rem; }
  `,
})
export class AdminPagination {
  total = input.required<number>();
  pagina = input.required<number>();
  tamano = input.required<number>();
  paginaChange = output<number>();
  tamanoChange = output<number>();

  opciones = PAGE_SIZE_OPTIONS;
  paginas = computed(() => totalPaginas(this.total(), this.tamano()));
  rango = computed(() => rangoPagina(this.pagina(), this.tamano(), this.total()));

  onTamanoChange(event: Event): void {
    const val = +(event.target as HTMLSelectElement).value;
    this.tamanoChange.emit(val);
    this.paginaChange.emit(1);
  }
}
