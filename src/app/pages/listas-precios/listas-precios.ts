import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ListaPrecioService } from '../../services/lista-precio.service';
import { ProductService } from '../../services/product';
import { ToastService } from '../../services/toast.service';
import { ListaPrecio, ListaPrecioDetalle, Product } from '../../models/models';
import { LISTAS_PRECIO, labelLista, jerarquiaLista } from '../../models/listas-precio';

/**
 * Página `listas-precios`: pantalla Angular (componente + template) del módulo listas-precios.
 */
@Component({
  selector: 'app-listas-precios',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './listas-precios.html',
})
export class ListasPrecios implements OnInit {
  listas = signal<ListaPrecio[]>([]);
  sel = signal<ListaPrecio | null>(null);
  detalles = signal<ListaPrecioDetalle[]>([]);
  cargando = signal(false);
  guardando = signal(false);

  descuentoGlobalEdit = signal(0);
  busquedaProducto = signal('');
  resultadosProducto = signal<Product[]>([]);

  modoUnitario = signal<'descuento' | 'precio'>('descuento');
  unitDescuento = signal<number | null>(null);
  unitPrecioFijo = signal<number | null>(null);
  productoSel = signal<Product | null>(null);

  readonly catalogo = LISTAS_PRECIO;

  reglasJerarquia = computed(() => {
    const s = this.sel();
    if (!s) return '';
    const rank = jerarquiaLista(s.codigo);
    if (rank <= 2) {
      return 'Mayorista/B2B: descuento global debe ser ≥ e-commerce y local.';
    }
    return 'E-commerce/Local: descuento global debe ser ≤ mayorista y B2B.';
  });

  constructor(
    private listaService: ListaPrecioService,
    private productService: ProductService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.cargarListas();
  }

  cargarListas(): void {
    this.cargando.set(true);
    this.listaService.listar().subscribe({
      next: list => {
        this.listas.set(list.sort((a, b) => jerarquiaLista(a.codigo) - jerarquiaLista(b.codigo)));
        this.cargando.set(false);
        if (!this.sel() && list.length) {
          this.seleccionar(list[0]);
        }
      },
      error: () => {
        this.cargando.set(false);
        this.toast.error('No se pudieron cargar las listas de precios.');
      },
    });
  }

  seleccionar(l: ListaPrecio): void {
    this.sel.set(l);
    this.descuentoGlobalEdit.set(Number(l.descuentoGlobal ?? 0));
    this.limpiarFormUnitario();
    if (l.idListaPrecio) {
      this.listaService.listarDetalles(l.idListaPrecio).subscribe(d => this.detalles.set(d));
    }
  }

  metaCodigo(codigo: string) {
    return LISTAS_PRECIO.find(x => x.codigo === codigo);
  }

  guardarGlobal(): void {
    const l = this.sel();
    if (!l?.idListaPrecio) return;
    this.guardando.set(true);
    this.listaService.actualizar(l.idListaPrecio, {
      descuentoGlobal: this.descuentoGlobalEdit(),
    }).subscribe({
      next: updated => {
        this.guardando.set(false);
        this.sel.set(updated);
        this.listas.update(arr => arr.map(x => x.idListaPrecio === updated.idListaPrecio ? updated : x));
        this.toast.exito('Descuento global actualizado.');
      },
      error: err => {
        this.guardando.set(false);
        this.toast.error(this.msgError(err));
      },
    });
  }

  buscarProducto(): void {
    const q = this.busquedaProducto().trim();
    if (q.length < 2) {
      this.resultadosProducto.set([]);
      return;
    }
    this.productService.listarConFiltros({ nombre: q }).subscribe(list => this.resultadosProducto.set(list.slice(0, 12)));
  }

  elegirProducto(p: Product): void {
    this.productoSel.set(p);
    this.busquedaProducto.set(p.nombre);
    this.resultadosProducto.set([]);
  }

  guardarUnitario(): void {
    const l = this.sel();
    const p = this.productoSel();
    if (!l?.idListaPrecio || !p?.idProducto) {
      this.toast.error('Seleccioná un producto.');
      return;
    }
    const body: { idProducto: number; descuentoPorcentaje?: number; precioFijo?: number } = {
      idProducto: p.idProducto,
    };
    if (this.modoUnitario() === 'descuento') {
      if (this.unitDescuento() == null) {
        this.toast.error('Indicá el descuento unitario %.');
        return;
      }
      body.descuentoPorcentaje = this.unitDescuento()!;
    } else {
      if (this.unitPrecioFijo() == null) {
        this.toast.error('Indicá el precio fijo.');
        return;
      }
      body.precioFijo = this.unitPrecioFijo()!;
    }
    this.guardando.set(true);
    this.listaService.guardarDetalle(l.idListaPrecio, body).subscribe({
      next: () => {
        this.guardando.set(false);
        this.listaService.listarDetalles(l.idListaPrecio!).subscribe(d => this.detalles.set(d));
        this.limpiarFormUnitario();
        this.toast.exito('Precio unitario guardado.');
      },
      error: err => {
        this.guardando.set(false);
        this.toast.error(this.msgError(err));
      },
    });
  }

  eliminarDetalle(d: ListaPrecioDetalle): void {
    const l = this.sel();
    if (!l?.idListaPrecio || !d.idDetalle) return;
    if (!confirm('¿Quitar override unitario de este producto?')) return;
    this.listaService.eliminarDetalle(l.idListaPrecio, d.idDetalle).subscribe({
      next: () => {
        this.detalles.update(arr => arr.filter(x => x.idDetalle !== d.idDetalle));
        this.toast.exito('Override eliminado.');
      },
      error: err => this.toast.error(this.msgError(err)),
    });
  }

  limpiarFormUnitario(): void {
    this.productoSel.set(null);
    this.busquedaProducto.set('');
    this.unitDescuento.set(null);
    this.unitPrecioFijo.set(null);
    this.resultadosProducto.set([]);
  }

  labelLista = labelLista;

  private msgError(err: unknown): string {
    const e = err as { error?: { message?: string; mensaje?: string } };
    return e?.error?.message ?? e?.error?.mensaje ?? 'Error de validación.';
  }
}
