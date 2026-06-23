import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { OrdenCompraService } from '../../services/orden-compra.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { AdminPagination } from '../../components/admin-pagination/admin-pagination';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { descargarCsv } from '../../utils/export-csv';
import { paginar, PAGE_SIZE_DEFAULT } from '../../utils/paginar';
import { DashboardService } from '../../services/dashboard.service';
import { esStockBajo, stockMinimoEfectivo } from '../../utils/stock-inventario.util';
import { Product } from '../../models/models';

type FiltroStock = 'TODOS' | 'BAJO' | 'SIN_STOCK';

@Component({
  selector: 'app-product-list',
  imports: [FormsModule, DecimalPipe, RouterLink, AdminSearch, AdminPagination],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products = signal<Product[]>([]);
  busqueda = signal('');
  filtroStock = signal<FiltroStock>('TODOS');
  seleccionados = signal<Set<number>>(new Set());
  imagenAmpliada = signal<string | null>(null);
  procesando = signal(false);
  cargando = signal(true);
  ok = signal('');
  error = signal('');
  pagina = signal(1);
  tamanoPagina = signal(PAGE_SIZE_DEFAULT);

  productsFiltrados = computed(() => {
    const q = this.busqueda();
    return this.products().filter(p => {
      if (!this.pasaFiltroStock(p)) return false;
      return coincideBusqueda(q,
        p.nombre, p.descripcion, p.proveedor, p.categoria?.nombre,
        p.precio, p.precioLista, p.stock, p.idProducto,
      );
    });
  });

  productsPaginados = computed(() =>
    paginar(this.productsFiltrados(), this.pagina(), this.tamanoPagina()),
  );

  conteoStockBajo = computed(() => this.products().filter(p => esStockBajo(p)).length);
  /** Mismo contador que el dashboard (API); fallback al conteo local. */
  conteoStockBajoBanner = signal<number | null>(null);
  conteoStockBajoVisible = computed(() => this.conteoStockBajoBanner() ?? this.conteoStockBajo());

  readonly stockMinimo = stockMinimoEfectivo;
  readonly esStockBajo = esStockBajo;

  constructor(
    private productService: ProductService,
    private ordenService: OrdenCompraService,
    private dashboardService: DashboardService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const stock = params.get('stock');
      if (stock === 'BAJO') this.filtroStock.set('BAJO');
    });
    this.cargar();
    this.dashboardService.kpis().subscribe({
      next: k => this.conteoStockBajoBanner.set(k.productosBajoStock),
      error: () => this.conteoStockBajoBanner.set(null),
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.productService.listar().subscribe({
      next: list => {
        this.products.set(list);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar los productos.');
      },
    });
  }

  pasaFiltroStock(p: Product): boolean {
    const f = this.filtroStock();
    if (f === 'BAJO') return esStockBajo(p);
    if (f === 'SIN_STOCK') return (p.stock ?? 0) === 0;
    return true;
  }

  descripcionCorta(texto?: string, max = 72): string {
    if (!texto?.trim()) return '—';
    const t = texto.trim();
    return t.length <= max ? t : t.slice(0, max).trimEnd() + '…';
  }

  precioLista(p: Product): number {
    return p.precioLista ?? p.precio ?? 0;
  }

  tieneDescuento(p: Product): boolean {
    return this.precioLista(p) > (p.precio ?? 0);
  }

  badgeStock(p: Product): { cls: string; label: string } {
    if ((p.stock ?? 0) === 0) return { cls: 'prod-badge prod-badge--out', label: 'Sin stock' };
    if (esStockBajo(p)) return { cls: 'prod-badge prod-badge--low', label: 'Stock bajo' };
    return { cls: 'prod-badge prod-badge--ok', label: 'OK' };
  }

  toggleSeleccion(id?: number): void {
    if (id == null) return;
    const set = new Set(this.seleccionados());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.seleccionados.set(set);
  }

  toggleTodos(): void {
    const visibles = this.productsFiltrados().map(p => p.idProducto).filter((id): id is number => id != null);
    const set = this.seleccionados();
    const todosMarcados = visibles.length > 0 && visibles.every(id => set.has(id));
    if (todosMarcados) {
      const next = new Set(set);
      visibles.forEach(id => next.delete(id));
      this.seleccionados.set(next);
    } else {
      const next = new Set(set);
      visibles.forEach(id => next.add(id));
      this.seleccionados.set(next);
    }
  }

  ampliarImagen(src?: string): void {
    if (src) this.imagenAmpliada.set(src);
  }

  cerrarImagen(): void {
    this.imagenAmpliada.set(null);
  }

  generarOcAutomatica(): void {
    if (!confirm('¿Generar órdenes de compra para TODOS los productos con stock bajo? Se agrupan por proveedor.')) return;
    this.procesando.set(true);
    this.error.set('');
    this.ordenService.generarStockBajo().subscribe({
      next: ordenes => {
        this.procesando.set(false);
        this.ok.set(`Se generaron ${ordenes.length} orden(es) de compra.`);
        this.seleccionados.set(new Set());
        this.router.navigate(['/admin/ordenes-compra']);
      },
      error: e => {
        this.procesando.set(false);
        this.error.set(e.error?.message ?? 'No se pudo generar la orden.');
      },
    });
  }

  generarOcSeleccionados(): void {
    const ids = [...this.seleccionados()];
    if (ids.length === 0) {
      this.error.set('Seleccioná al menos un producto.');
      return;
    }
    this.procesando.set(true);
    this.error.set('');
    this.ordenService.generar(ids).subscribe({
      next: ordenes => {
        this.procesando.set(false);
        this.ok.set(`${ordenes.length} orden(es) creada(s) para ${ids.length} producto(s).`);
        this.seleccionados.set(new Set());
        this.router.navigate(['/admin/ordenes-compra']);
      },
      error: e => {
        this.procesando.set(false);
        this.error.set(e.error?.message ?? 'Error al generar.');
      },
    });
  }

  generarOcProducto(p: Product, event: Event): void {
    event.stopPropagation();
    if (!p.idProducto) return;
    this.procesando.set(true);
    this.ordenService.generar([p.idProducto]).subscribe({
      next: () => {
        this.procesando.set(false);
        this.ok.set(`Orden de compra creada para ${p.nombre}.`);
        this.router.navigate(['/admin/ordenes-compra']);
      },
      error: e => {
        this.procesando.set(false);
        this.error.set(e.error?.message ?? 'Error.');
      },
    });
  }

  nuevo(): void {
    this.router.navigate(['/admin/productos/nuevo']);
  }

  editar(id: number): void {
    this.router.navigate(['/admin/productos', id, 'editar']);
  }

  borrar(id: number): void {
    if (!confirm('¿Eliminar este producto?')) return;
    this.productService.eliminar(id).subscribe(() => this.cargar());
  }

  exportarCsv(): void {
    descargarCsv('productos', [
      { clave: 'id', encabezado: 'ID' },
      { clave: 'nombre', encabezado: 'Nombre' },
      { clave: 'categoria', encabezado: 'Categoría' },
      { clave: 'precio', encabezado: 'Precio' },
      { clave: 'stock', encabezado: 'Stock' },
      { clave: 'proveedor', encabezado: 'Proveedor' },
    ], this.productsFiltrados().map(p => ({
      id: p.idProducto,
      nombre: p.nombre,
      categoria: p.categoria?.nombre ?? '',
      precio: p.precio,
      stock: p.stock,
      proveedor: p.proveedor,
    })));
  }
}
