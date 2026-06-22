import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FacturaService } from '../../services/factura.service';
import { PedidoService } from '../../services/pedido.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { AdminPagination } from '../../components/admin-pagination/admin-pagination';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { descargarCsv } from '../../utils/export-csv';
import { paginar, PAGE_SIZE_DEFAULT } from '../../utils/paginar';
import { esEnteroPositivo, esPorcentaje } from '../../utils/validadores-admin';
import { labelCondicionIva } from '../../models/condiciones-iva';
import { PlantillaPrintService } from '../../services/plantilla-print.service';
import { Factura, Pedido } from '../../models/models';

@Component({
  selector: 'app-facturacion',
  imports: [FormsModule, DatePipe, DecimalPipe, AdminSearch, RouterLink, AdminPagination],
  templateUrl: './facturacion.html',
  styleUrl: './facturacion.css',
})
export class Facturacion implements OnInit {
  facturas = signal<Factura[]>([]);
  pedidos = signal<Pedido[]>([]);
  pedidoId = signal<number | null>(null);
  prestamoPersonal = signal(false);
  cantidadCuotas = signal(6);
  interesPrestamo = signal(20);
  busqueda = signal('');
  filtroEstado = signal('');
  facturaSeleccionada = signal<Factura | null>(null);
  generando = signal(false);
  cargando = signal(true);
  ok = signal('');
  error = signal('');
  facturaDestacada = signal<number | null>(null);
  pagina = signal(1);
  tamanoPagina = signal(PAGE_SIZE_DEFAULT);

  cuotasDisponibles = Array.from({ length: 24 }, (_, i) => i + 1);

  facturasFiltradas = computed(() => {
    const q = this.busqueda();
    const est = this.filtroEstado();
    return this.facturas().filter(f => {
      if (est && (f.estado ?? '').toUpperCase() !== est.toUpperCase()) return false;
      return coincideBusqueda(q,
        f.numeroFactura,
        f.idFactura,
        f.pedido?.idPedido,
        f.pedido?.usuario?.nombre,
        f.presupuesto?.cliente?.usuario?.nombre,
        f.presupuesto?.numeroPresupuesto,
        f.pedido?.usuario?.email,
        f.estado,
        f.formaCobro,
        f.tipoComprobante,
        f.total,
      );
    });
  });

  facturasPaginadas = computed(() =>
    paginar(this.facturasFiltradas(), this.pagina(), this.tamanoPagina()),
  );

  constructor(
    private facturaService: FacturaService,
    private pedidoService: PedidoService,
    private plantillaPrint: PlantillaPrintService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const ped = params.get('pedido');
      if (ped) this.pedidoId.set(+ped);
      const fac = params.get('factura');
      if (fac) {
        this.facturaDestacada.set(+fac);
        const id = +fac;
        this.facturaService.obtener(id).subscribe(f => this.facturaSeleccionada.set(f));
      }
    });
    this.cargar();
    this.pedidoService.listar().subscribe(p => this.pedidos.set(p));
  }

  cargar(): void {
    this.cargando.set(true);
    this.facturaService.listar().subscribe({
      next: f => {
        this.facturas.set(f);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar las facturas.');
      },
    });
  }

  generar(): void {
    const id = this.pedidoId();
    if (!id) {
      this.error.set('Seleccioná un pedido.');
      return;
    }
    if (this.prestamoPersonal()) {
      const cuotas = this.cantidadCuotas();
      const interes = String(this.interesPrestamo());
      if (!esEnteroPositivo(cuotas) || cuotas > 24) {
        this.error.set('Cantidad de cuotas: entero entre 1 y 24.');
        return;
      }
      if (!esPorcentaje(interes)) {
        this.error.set('Interés: porcentaje entre 0 y 100.');
        return;
      }
    }
    this.error.set('');
    this.generando.set(true);
    const opciones = this.prestamoPersonal()
      ? {
          formaCobro: 'PRESTAMO_PERSONAL',
          cantidadCuotas: this.cantidadCuotas(),
          interes: this.interesPrestamo(),
        }
      : { formaCobro: 'CONTADO' };

    this.facturaService.generarDesdePedido(id, opciones).subscribe({
      next: () => {
        this.generando.set(false);
        this.ok.set(this.prestamoPersonal()
          ? `Factura emitida: ${this.cantidadCuotas()} cuotas al ${this.interesPrestamo()}% (cobro 1-10 de cada mes).`
          : 'Factura generada y emitida.');
        this.pedidoId.set(null);
        this.prestamoPersonal.set(false);
        this.cantidadCuotas.set(6);
        this.interesPrestamo.set(20);
        this.cargar();
      },
      error: e => {
        this.generando.set(false);
        this.error.set(e.error?.message ?? 'No se pudo generar.');
      },
    });
  }

  anular(f: Factura): void {
    if (!f.idFactura || !confirm('¿Anular factura ' + f.numeroFactura + '?')) return;
    this.facturaService.actualizar(f.idFactura, { ...f, estado: 'ANULADA' }).subscribe(() => this.cargar());
  }

  badgeEstado(estado?: string): string {
    if (estado === 'EMITIDA') return 'admin-badge admin-badge--emitida';
    if (estado === 'ANULADA') return 'admin-badge admin-badge--vencida';
    return 'admin-badge admin-badge--borrador';
  }

  labelFormaCobro(f: Factura): string {
    if (f.formaCobro === 'PRESTAMO_PERSONAL') {
      return `Préstamo ${f.cantidadCuotas ?? '—'} cuotas`;
    }
    return 'Contado';
  }

  filaDestacada(id?: number): boolean {
    const dest = this.facturaDestacada();
    return dest != null && id != null && dest === id;
  }

  verDetalle(f: Factura): void {
    if (!f.idFactura) {
      this.facturaSeleccionada.set(f);
      return;
    }
    this.facturaService.obtener(f.idFactura).subscribe(full => this.facturaSeleccionada.set(full));
  }

  cerrarDetalle(): void {
    this.facturaSeleccionada.set(null);
  }

  nombreCliente(f: Factura): string {
    return f.pedido?.usuario?.nombre
      ?? f.presupuesto?.cliente?.usuario?.nombre
      ?? 'Cliente manual';
  }

  cuitCliente(f: Factura): string {
    return f.cuitCliente
      ?? f.presupuesto?.cliente?.cuit
      ?? '—';
  }

  condicionIvaCliente(f: Factura): string {
    const raw = f.condicionIvaCliente ?? f.presupuesto?.cliente?.condicionIva;
    return labelCondicionIva(raw);
  }

  labelTipoComprobante(tipo?: string): string {
    if (!tipo) return 'Factura';
    return tipo.replace('FACTURA_', 'Factura ');
  }

  imprimirPdf(f?: Factura): void {
    const target = f ?? this.facturaSeleccionada();
    if (!target?.idFactura) return;

    const fallback = (factura: Factura) => {
      this.facturaSeleccionada.set(factura);
      setTimeout(() => window.print(), 150);
    };

    const lanzar = (factura: Factura) => {
      this.plantillaPrint.printWithFallback(
        this.plantillaPrint.renderFactura(factura.idFactura!),
        () => fallback(factura),
      );
    };

    if (target.lineas?.length) {
      lanzar(target);
      return;
    }
    this.facturaService.obtener(target.idFactura).subscribe(lanzar);
  }

  labelOrigen(f: Factura): string {
    if (f.presupuesto) return 'Presupuesto';
    if (f.pedido) return 'Pedido';
    return 'Manual';
  }

  exportarCsv(): void {
    descargarCsv('facturas', [
      { clave: 'numero', encabezado: 'Número' },
      { clave: 'cliente', encabezado: 'Cliente' },
      { clave: 'pedido', encabezado: 'Pedido' },
      { clave: 'estado', encabezado: 'Estado' },
      { clave: 'total', encabezado: 'Total' },
      { clave: 'fecha', encabezado: 'Fecha emisión' },
    ], this.facturasFiltradas().map(f => ({
      numero: f.numeroFactura,
      cliente: f.pedido?.usuario?.nombre ?? f.presupuesto?.cliente?.usuario?.nombre ?? '',
      pedido: f.pedido?.idPedido ?? '',
      estado: f.estado ?? '',
      total: f.total,
      fecha: f.fechaEmision ?? '',
    })));
  }
}
