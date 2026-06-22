import { Component, computed, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DecimalPipe, LowerCasePipe } from '@angular/common';

import { FacturaService } from '../../services/factura.service';

import { PresupuestoService } from '../../services/presupuesto.service';

import { PedidoService } from '../../services/pedido.service';

import { ClienteCrmService } from '../../services/cliente-crm.service';

import { ProductService } from '../../services/product';

import { esEnteroPositivo, esPorcentaje } from '../../utils/validadores-admin';

import {

  DetallePedido,

  DetallePresupuesto,

  GenerarFacturaRequest,

  LineaComprobante,

  Pedido,

  PerfilCliente,

  Presupuesto,

  Product,

} from '../../models/models';



interface LineaManual {

  producto: Product;

  cantidad: number;

  precioUnitario: number;

  descuentoPorcentaje: number;

}



type ModoOrigen = 'manual' | 'presupuesto' | 'pedido';



@Component({

  selector: 'app-factura-nueva',

  imports: [FormsModule, DecimalPipe, LowerCasePipe, RouterLink],

  templateUrl: './factura-nueva.html',

})

export class FacturaNueva implements OnInit {

  presupuesto = signal<Presupuesto | null>(null);

  pedido = signal<Pedido | null>(null);

  pedidoDetalles = signal<DetallePedido[]>([]);

  presupuestoId = signal<number | null>(null);

  pedidoId = signal<number | null>(null);



  clientes = signal<PerfilCliente[]>([]);

  productos = signal<Product[]>([]);

  busquedaProducto = signal('');

  lineasManual = signal<LineaManual[]>([]);

  idCliente = signal<number | null>(null);



  puntoVenta = signal(1);

  tipoComprobante = signal('FACTURA_B');

  formaCobro = signal('CONTADO');

  notas = signal('');

  prestamoPersonal = signal(false);

  cantidadCuotas = signal(6);

  interesPrestamo = signal(20);



  cargando = signal(false);

  generando = signal(false);

  error = signal('');

  ok = signal('');



  tiposComprobante = ['FACTURA_A', 'FACTURA_B', 'FACTURA_C'];

  cuotasDisponibles = Array.from({ length: 24 }, (_, i) => i + 1);



  modo = computed<ModoOrigen>(() => {

    if (this.presupuestoId()) return 'presupuesto';

    if (this.pedidoId()) return 'pedido';

    return 'manual';

  });



  tituloOrigen = computed(() => {

    const p = this.presupuesto();

    const ped = this.pedido();

    if (p) return `Desde presupuesto ${p.numeroPresupuesto ?? '#' + p.idPresupuesto}`;

    if (ped) return `Desde pedido #${ped.idPedido}`;

    return 'Factura manual';

  });



  badgeOrigen = computed(() => {

    const m = this.modo();

    if (m === 'presupuesto') return 'admin-badge admin-badge--blue';

    if (m === 'pedido') return 'admin-badge admin-badge--violet';

    return 'admin-badge admin-badge--borrador';

  });



  labelOrigen = computed(() => {

    const m = this.modo();

    if (m === 'presupuesto') return 'Presupuesto';

    if (m === 'pedido') return 'Pedido';

    return 'Manual';

  });



  clienteSeleccionado = computed(() => {

    const p = this.presupuesto();

    if (p?.cliente) return p.cliente;

    const ped = this.pedido();

    if (ped?.usuario) {

      return {

        usuario: ped.usuario,

        condicionIva: undefined as string | undefined,

        cuit: undefined as string | undefined,

      } satisfies Partial<PerfilCliente>;

    }

    const id = this.idCliente();

    return this.clientes().find(c => c.idCliente === id) ?? null;

  });



  lineasPresupuesto = computed(() => this.presupuesto()?.lineas ?? []);



  lineasPedido = computed(() => this.pedidoDetalles());



  lineasEditables = computed(() => this.modo() === 'manual');



  productosFiltrados = computed(() => {

    const q = this.busquedaProducto().trim().toLowerCase();

    if (!q) return this.productos().slice(0, 12);

    return this.productos().filter(p =>

      (p.nombre ?? '').toLowerCase().includes(q)

      || String(p.idProducto ?? '').includes(q)

      || (p.proveedor ?? '').includes(q),

    ).slice(0, 20);

  });



  subtotalManual = computed(() =>

    this.lineasManual().reduce((acc, l) => {

      const bruto = l.precioUnitario * l.cantidad;

      return acc + bruto * (1 - l.descuentoPorcentaje / 100);

    }, 0),

  );



  ivaManual = computed(() => {

    const tasa = this.tasaIvaCliente(this.clienteManual()?.condicionIva);

    return this.subtotalManual() * tasa;

  });



  totalManual = computed(() => this.subtotalManual() + this.ivaManual());



  totales = computed(() => {

    const p = this.presupuesto();

    if (p) return { subtotal: p.subtotal ?? 0, iva: p.iva ?? 0, total: p.total ?? 0 };

    const ped = this.pedido();

    if (ped) {

      const total = ped.total ?? 0;

      const tasa = 0.21;

      const subtotal = total / (1 + tasa);

      return { subtotal, iva: total - subtotal, total };

    }

    return { subtotal: this.subtotalManual(), iva: this.ivaManual(), total: this.totalManual() };

  });



  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private facturaService: FacturaService,

    private presupuestoService: PresupuestoService,

    private pedidoService: PedidoService,

    private clienteService: ClienteCrmService,

    private productService: ProductService,

  ) {}



  ngOnInit(): void {

    this.clienteService.listar().subscribe(c => this.clientes.set(c));

    this.productService.listar().subscribe(p => this.productos.set(p));



    this.route.queryParamMap.subscribe(params => {

      this.presupuesto.set(null);

      this.pedido.set(null);

      this.pedidoDetalles.set([]);

      this.presupuestoId.set(null);

      this.pedidoId.set(null);

      this.error.set('');



      const presId = params.get('presupuestoId');

      const pedId = params.get('pedidoId');

      if (presId) {

        this.cargando.set(true);

        this.presupuestoId.set(+presId);

        this.presupuestoService.obtener(+presId).subscribe({

          next: p => {

            this.presupuesto.set(p);

            this.tipoComprobante.set(this.inferirTipo(p.cliente?.condicionIva));

            this.notas.set(p.notas ?? '');

            this.cargando.set(false);

          },

          error: () => {

            this.error.set('No se pudo cargar el presupuesto.');

            this.cargando.set(false);

          },

        });

      } else if (pedId) {

        this.cargando.set(true);

        this.pedidoId.set(+pedId);

        this.pedidoService.obtenerDetalle(+pedId).subscribe({

          next: d => {

            this.pedido.set(d.pedido);

            this.pedidoDetalles.set(d.detalles ?? []);

            this.cargando.set(false);

          },

          error: () => {

            this.error.set('No se pudo cargar el pedido.');

            this.cargando.set(false);

          },

        });

      }

    });

  }



  clienteManual(): PerfilCliente | null {

    const id = this.idCliente();

    return this.clientes().find(c => c.idCliente === id) ?? null;

  }



  tasaIvaCliente(condicionIva?: string): number {

    if (!condicionIva) return 0.21;

    const c = condicionIva.toUpperCase();

    if (c === 'EXENTO' || c === 'SUJETO_EXENTO' || c === 'IVA_NO_ALCANZADO') return 0;

    return 0.21;

  }



  inferirTipo(condicionIva?: string): string {

    if (condicionIva === 'RESPONSABLE_INSCRIPTO') return 'FACTURA_A';

    if (condicionIva === 'MONOTRIBUTO') return 'FACTURA_C';

    return 'FACTURA_B';

  }



  labelCondicionIva(condicion?: string): string {

    if (!condicion) return 'Consumidor final';

    return condicion.replace(/_/g, ' ');

  }



  labelTipoComprobante(tipo: string): string {

    return tipo.replace('FACTURA_', 'Factura ');

  }



  subtotalLineaPresupuesto(l: DetallePresupuesto): number {

    return l.subtotal ?? (l.precioUnitario ?? 0) * (l.cantidad ?? 0);

  }



  subtotalLineaPedido(l: DetallePedido): number {

    return (l.precioUnitario ?? 0) * (l.cantidad ?? 0);

  }



  subtotalLineaManual(l: LineaManual): number {

    const bruto = l.precioUnitario * l.cantidad;

    return bruto * (1 - l.descuentoPorcentaje / 100);

  }



  onClienteChange(id: number | null): void {

    this.idCliente.set(id);

    const c = this.clientes().find(cl => cl.idCliente === id);

    if (c) this.tipoComprobante.set(this.inferirTipo(c.condicionIva));

  }



  agregarProducto(p: Product): void {

    const actuales = [...this.lineasManual()];

    const idx = actuales.findIndex(l => l.producto.idProducto === p.idProducto);

    if (idx >= 0) {

      actuales[idx] = { ...actuales[idx], cantidad: actuales[idx].cantidad + 1 };

    } else {

      actuales.push({ producto: p, cantidad: 1, precioUnitario: p.precio, descuentoPorcentaje: 0 });

    }

    this.lineasManual.set(actuales);

    this.error.set('');

  }



  quitarLinea(idProducto?: number): void {

    this.lineasManual.set(this.lineasManual().filter(l => l.producto.idProducto !== idProducto));

  }



  cambiarCantidad(idProducto: number | undefined, cantidad: number): void {

    if (!idProducto || cantidad < 1) return;

    this.lineasManual.set(this.lineasManual().map(l =>

      l.producto.idProducto === idProducto ? { ...l, cantidad } : l,

    ));

  }



  emitir(): void {

    const presId = this.presupuestoId();

    const pedId = this.pedidoId();



    if (this.prestamoPersonal() && pedId) {

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



    if (!presId && !pedId) {

      if (!this.idCliente()) {

        this.error.set('Seleccioná un cliente.');

        return;

      }

      if (this.lineasManual().length === 0) {

        this.error.set('Agregá al menos un producto.');

        return;

      }

    }



    this.generando.set(true);

    this.error.set('');



    const opcionesBase = {

      puntoVenta: this.puntoVenta(),

      tipoComprobante: this.tipoComprobante(),

      formaCobro: this.prestamoPersonal() ? 'PRESTAMO_PERSONAL' : this.formaCobro(),

      cantidadCuotas: this.prestamoPersonal() ? this.cantidadCuotas() : undefined,

      interes: this.prestamoPersonal() ? this.interesPrestamo() : undefined,

    };



    let obs;

    if (presId) {

      obs = this.facturaService.generarDesdePresupuesto(presId, { ...opcionesBase, notas: this.notas() || undefined });

    } else if (pedId) {

      obs = this.facturaService.generarDesdePedido(pedId, opcionesBase);

    } else {

      const body: GenerarFacturaRequest = {

        clienteId: this.idCliente()!,

        lineas: this.lineasManual().map(l => ({

          idProducto: l.producto.idProducto!,

          cantidad: l.cantidad,

          precioUnitario: l.precioUnitario,

          descuentoPorcentaje: l.descuentoPorcentaje,

        } satisfies LineaComprobante)),

        notas: this.notas() || undefined,

        puntoVenta: this.puntoVenta(),

        tipoComprobante: this.tipoComprobante(),

        formaCobro: this.formaCobro(),

      };

      obs = this.facturaService.generar(body);

    }



    obs.subscribe({

      next: f => {

        this.generando.set(false);

        this.ok.set('Factura ' + (f.numeroFactura ?? '') + ' emitida.');

        setTimeout(() => this.router.navigate(['/admin/facturacion'], { queryParams: { factura: f.idFactura } }), 1200);

      },

      error: e => {

        this.generando.set(false);

        this.error.set(e.error?.message ?? 'No se pudo emitir.');

      },

    });

  }

}


