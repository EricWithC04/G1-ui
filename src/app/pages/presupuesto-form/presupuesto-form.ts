import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { ClienteCrmService } from '../../services/cliente-crm.service';
import { PresupuestoService } from '../../services/presupuesto.service';
import { LineaComprobante, PerfilCliente, Product } from '../../models/models';

interface LineaForm {
  producto: Product;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
}

@Component({
  selector: 'app-presupuesto-form',
  imports: [FormsModule, DecimalPipe, RouterLink],
  templateUrl: './presupuesto-form.html',
})
export class PresupuestoForm implements OnInit {
  clientes = signal<PerfilCliente[]>([]);
  productos = signal<Product[]>([]);
  busquedaProducto = signal('');
  lineas = signal<LineaForm[]>([]);

  idCliente = signal<number | null>(null);
  validezHasta = signal('');
  notas = signal('');
  editId = signal<number | null>(null);

  procesando = signal(false);
  error = signal('');
  ok = signal('');

  productosFiltrados = computed(() => {
    const q = this.busquedaProducto().trim().toLowerCase();
    if (!q) return this.productos().slice(0, 12);
    return this.productos().filter(p =>
      (p.nombre ?? '').toLowerCase().includes(q)
      || String(p.idProducto ?? '').includes(q),
    ).slice(0, 20);
  });

  subtotal = computed(() =>
    this.lineas().reduce((acc, l) => {
      const bruto = l.precioUnitario * l.cantidad;
      return acc + bruto * (1 - l.descuentoPorcentaje / 100);
    }, 0),
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private clienteService: ClienteCrmService,
    private presupuestoService: PresupuestoService,
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 15);
    this.validezHasta.set(hoy.toISOString().slice(0, 10));

    this.clienteService.listar().subscribe(c => this.clientes.set(c));
    this.productService.listar().subscribe(p => this.productos.set(p));

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && this.route.snapshot.url.some(s => s.path === 'editar')) {
        this.editId.set(+id);
        this.cargarPresupuesto(+id);
      }
    });
  }

  cargarPresupuesto(id: number): void {
    this.presupuestoService.obtener(id).subscribe(p => {
      this.idCliente.set(p.cliente?.idCliente ?? null);
      this.validezHasta.set(p.validezHasta?.slice(0, 10) ?? '');
      this.notas.set(p.notas ?? '');
      this.lineas.set((p.lineas ?? []).map(l => ({
        producto: l.producto!,
        cantidad: l.cantidad ?? 1,
        precioUnitario: l.precioUnitario ?? l.producto?.precio ?? 0,
        descuentoPorcentaje: l.descuentoPorcentaje ?? 0,
      })));
    });
  }

  agregarProducto(p: Product): void {
    const actuales = [...this.lineas()];
    const idx = actuales.findIndex(l => l.producto.idProducto === p.idProducto);
    if (idx >= 0) {
      actuales[idx] = { ...actuales[idx], cantidad: actuales[idx].cantidad + 1 };
    } else {
      actuales.push({ producto: p, cantidad: 1, precioUnitario: p.precio, descuentoPorcentaje: 0 });
    }
    this.lineas.set(actuales);
  }

  quitarLinea(idProducto?: number): void {
    this.lineas.set(this.lineas().filter(l => l.producto.idProducto !== idProducto));
  }

  guardar(): void {
    const idCli = this.idCliente();
    if (!idCli) {
      this.error.set('Seleccioná un cliente.');
      return;
    }
    if (this.lineas().length === 0) {
      this.error.set('Agregá al menos una línea.');
      return;
    }

    const lineas: LineaComprobante[] = this.lineas().map(l => ({
      idProducto: l.producto.idProducto!,
      cantidad: l.cantidad,
      precioUnitario: l.precioUnitario,
      descuentoPorcentaje: l.descuentoPorcentaje,
    }));

    const request = {
      idCliente: idCli,
      validezHasta: this.validezHasta(),
      notas: this.notas().trim() || undefined,
      lineas,
    };

    this.procesando.set(true);
    this.error.set('');
    const editId = this.editId();
    const obs = editId
      ? this.presupuestoService.actualizarRequest(editId, request)
      : this.presupuestoService.crearDesdeRequest(request);

    obs.subscribe({
      next: p => {
        this.procesando.set(false);
        this.router.navigate(['/admin/presupuestos', p.idPresupuesto]);
      },
      error: e => {
        this.procesando.set(false);
        this.error.set(e.error?.message ?? 'No se pudo guardar.');
      },
    });
  }
}
