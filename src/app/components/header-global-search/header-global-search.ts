import { Component, ElementRef, HostListener, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, EMPTY } from 'rxjs';
import { AdminBuscarItem, AdminBuscarResponse, AdminService } from '../../services/admin.service';

type GrupoBusqueda = { etiqueta: string; items: AdminBuscarItem[] };

@Component({
  selector: 'app-header-global-search',
  imports: [FormsModule],
  templateUrl: './header-global-search.html',
  styleUrl: './header-global-search.css',
})
export class HeaderGlobalSearch implements OnInit, OnDestroy {
  termino = signal('');
  abierto = signal(false);
  cargando = signal(false);
  resultados = signal<AdminBuscarResponse | null>(null);
  indiceActivo = signal(-1);

  private busqueda$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  grupos = computed<GrupoBusqueda[]>(() => {
    const r = this.resultados();
    if (!r) return [];
    return [
      { etiqueta: 'Clientes', items: r.clientes ?? [] },
      { etiqueta: 'Facturas', items: r.facturas ?? [] },
      { etiqueta: 'Remitos', items: r.remitos ?? [] },
      { etiqueta: 'Presupuestos', items: r.presupuestos ?? [] },
    ].filter(g => g.items.length > 0);
  });

  itemsPlanos = computed(() => this.grupos().flatMap(g => g.items));

  totalResultados = computed(() => this.itemsPlanos().length);

  constructor(
    private admin: AdminService,
    private router: Router,
    private el: ElementRef<HTMLElement>,
  ) {}

  ngOnInit(): void {
    this.busqueda$.pipe(
      debounceTime(280),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.trim().length < 2) {
          this.cargando.set(false);
          this.resultados.set(null);
          return EMPTY;
        }
        this.cargando.set(true);
        return this.admin.buscar(q.trim());
      }),
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        this.resultados.set(res ?? null);
        this.cargando.set(false);
        this.indiceActivo.set(this.totalResultados() > 0 ? 0 : -1);
      },
      error: () => {
        this.cargando.set(false);
        this.resultados.set(null);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(valor: string): void {
    this.termino.set(valor);
    const q = valor.trim();
    if (q.length < 2) {
      this.abierto.set(false);
      this.resultados.set(null);
      this.indiceActivo.set(-1);
      return;
    }
    this.abierto.set(true);
    this.cargando.set(true);
    this.busqueda$.next(q);
  }

  onFocus(): void {
    if (this.termino().trim().length >= 2 && this.totalResultados() > 0) {
      this.abierto.set(true);
    }
  }

  limpiar(): void {
    this.termino.set('');
    this.resultados.set(null);
    this.abierto.set(false);
    this.indiceActivo.set(-1);
  }

  seleccionar(item: AdminBuscarItem): void {
    this.abierto.set(false);
    this.limpiar();
    this.router.navigateByUrl(item.link);
  }

  esActivo(item: AdminBuscarItem): boolean {
    const idx = this.itemsPlanos().indexOf(item);
    return idx === this.indiceActivo();
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.abierto() || this.totalResultados() === 0) {
      if (event.key === 'Escape') this.abierto.set(false);
      return;
    }
    const items = this.itemsPlanos();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = this.indiceActivo() + 1;
      this.indiceActivo.set(next >= items.length ? 0 : next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = this.indiceActivo() - 1;
      this.indiceActivo.set(prev < 0 ? items.length - 1 : prev);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.indiceActivo();
      if (idx >= 0 && idx < items.length) {
        this.seleccionar(items[idx]);
      }
    } else if (event.key === 'Escape') {
      this.abierto.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.abierto.set(false);
    }
  }
}
