import {

  Component,

  computed,

  ElementRef,

  HostListener,

  OnDestroy,

  OnInit,

  signal,

  viewChild,

} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Router, RouterLink } from '@angular/router';

import { DatePipe, DecimalPipe } from '@angular/common';

import { ProductService } from '../../services/product';

import { UsuarioService } from '../../services/usuario.service';

import { OrdenVentaService } from '../../services/orden-venta.service';

import { CategoriaService } from '../../services/categoria.service';

import { ToastService } from '../../services/toast.service';

import { ConfirmarOrdenRequest, Categoria, Product, Usuario } from '../../models/models';

import { esStockBajo, stockActual, stockMinimoEfectivo } from '../../utils/stock-inventario.util';



interface LineaPos {

  producto: Product;

  cantidad: number;

}



type MetodoPagoPos = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';



interface VentaExitosa {

  pedidoId: number;

  total: number;

  lineas: LineaPos[];

  metodoPago: MetodoPagoPos;

  clienteNombre: string;

  fecha: Date;

}



/**
 * Página `pos-mostrador`: pantalla Angular (componente + template) del módulo pos-mostrador.
 */
@Component({

  selector: 'app-pos-mostrador',

  imports: [FormsModule, DecimalPipe, DatePipe, RouterLink],

  templateUrl: './pos-mostrador.html',

  styleUrl: './pos-mostrador.css',

})

export class PosMostrador implements OnInit, OnDestroy {

  private searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');



  productos = signal<Product[]>([]);

  categorias = signal<Categoria[]>([]);

  clientes = signal<Usuario[]>([]);



  busqueda = signal('');

  busquedaDebounced = signal('');

  categoriaActiva = signal<number | null>(null);

  busquedaCliente = signal('');



  lineas = signal<LineaPos[]>([]);

  idCliente = signal<number | null>(null);

  metodoPago = signal<MetodoPagoPos>('EFECTIVO');



  cargandoProductos = signal(true);

  errorCarga = signal<string | null>(null);

  procesando = signal(false);

  error = signal<string | null>(null);



  ultimoFlashId = signal<number | null>(null);

  ventaExitosa = signal<VentaExitosa | null>(null);



  private debounceTimer?: ReturnType<typeof setTimeout>;



  metodos: MetodoPagoPos[] = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];



  clienteConsumidorFinal = computed(() => {

    const list = this.clientes();

    return list.find(c => (c.nombre ?? '').toLowerCase().includes('consumidor final'))

      ?? list.find(c => c.email === 'cliente@novatech.com')

      ?? list.find(c => (c.nombre ?? '').toLowerCase().includes('cliente demo'))

      ?? list[0]

      ?? null;

  });



  clientesFiltrados = computed(() => {

    const q = this.busquedaCliente().trim().toLowerCase();

    const list = this.clientes();

    if (!q) return list;

    return list.filter(c =>

      (c.nombre ?? '').toLowerCase().includes(q)

      || (c.email ?? '').toLowerCase().includes(q),

    );

  });



  esConsumidorFinal = computed(() => {

    const cf = this.clienteConsumidorFinal();

    const sel = this.idCliente();

    return !!cf && cf.idUsuario === sel;

  });



  productosVisibles = computed(() => {

    const q = this.busquedaDebounced().trim().toLowerCase();

    const catId = this.categoriaActiva();

    let list = this.productos();



    if (catId != null) {

      list = list.filter(p => p.categoria?.idCategoria === catId);

    }



    if (q) {

      list = list.filter(p =>

        (p.nombre ?? '').toLowerCase().includes(q)

        || String(p.idProducto ?? '').includes(q)

        || (p.proveedor ?? '').toLowerCase().includes(q)

        || String(p.stock ?? '').includes(q),

      );

      return list.slice(0, 24);

    }



    return list.slice(0, 18);

  });



  tituloCatalogo = computed(() => {

    if (this.busquedaDebounced().trim()) return 'Resultados';

    if (this.categoriaActiva() != null) {

      const cat = this.categorias().find(c => c.idCategoria === this.categoriaActiva());

      return cat?.nombre ?? 'Categoría';

    }

    return 'Catálogo';

  });



  cantidadItems = computed(() =>

    this.lineas().reduce((acc, l) => acc + l.cantidad, 0),

  );



  subtotal = computed(() =>

    this.lineas().reduce((acc, l) => acc + l.producto.precio * l.cantidad, 0),

  );



  clienteSeleccionado = computed(() => {

    const id = this.idCliente();

    if (!id) return null;

    return this.clientes().find(c => c.idUsuario === id) ?? null;

  });



  puedeCobrar = computed(() =>

    this.lineas().length > 0 && !!this.idCliente() && !this.procesando(),

  );



  constructor(

    private productService: ProductService,

    private usuarioService: UsuarioService,

    private ordenVentaService: OrdenVentaService,

    private categoriaService: CategoriaService,

    private toast: ToastService,

    private router: Router,

  ) {}



  ngOnInit(): void {

    this.cargarDatos();

  }

  recargarCatalogo(): void {

    this.cargarDatos();

  }



  ngOnDestroy(): void {

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

  }



  private cargarDatos(): void {

    this.cargandoProductos.set(true);

    this.errorCarga.set(null);



    this.productService.listarConFiltros({ canal: 'POS' }).subscribe({

      next: list => {

        this.productos.set(list.map(p => this.conPrecioCanal(p)));

        this.cargandoProductos.set(false);

      },

      error: () => {

        this.errorCarga.set('No se pudo cargar el catálogo.');

        this.cargandoProductos.set(false);

      },

    });



    this.categoriaService.listar().subscribe(list => this.categorias.set(list));



    this.usuarioService.listar().subscribe(list =>

      this.clientes.set(list.filter(u => u.rol === 'CLIENTE')),

    );

  }



  onBusquedaChange(value: string): void {

    this.busqueda.set(value);

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => this.busquedaDebounced.set(value), 280);

  }



  limpiarBusqueda(): void {

    this.busqueda.set('');

    this.busquedaDebounced.set('');

    this.focusBusqueda();

  }



  seleccionarCategoria(id: number | null): void {

    this.categoriaActiva.set(this.categoriaActiva() === id ? null : id);

  }



  stockBadgeClass(p: Product): string {

    const stock = stockActual(p);

    const min = stockMinimoEfectivo(p);

    if (stock <= 0) return 'pos-stock-badge--out';

    if (esStockBajo(p)) return 'pos-stock-badge--low';

    return 'pos-stock-badge--ok';

  }



  stockLabel(p: Product): string {

    const stock = stockActual(p);

    if (stock <= 0) return 'Sin stock';

    if (esStockBajo(p)) return `${stock} bajo`;

    return `${stock} u.`;

  }



  cantidadEnCarrito(idProducto?: number): number {

    if (!idProducto) return 0;

    return this.lineas().find(l => l.producto.idProducto === idProducto)?.cantidad ?? 0;

  }



  stockDisponible(p: Product): number {

    const stock = p.stock ?? 0;

    return Math.max(0, stock - this.cantidadEnCarrito(p.idProducto));

  }



  sinStock(p: Product): boolean {

    return this.stockDisponible(p) <= 0;

  }



  agregar(p: Product): void {

    if (this.sinStock(p)) {

      this.toast.error(`Sin stock disponible para "${p.nombre}".`);

      return;

    }



    const actuales = [...this.lineas()];

    const idx = actuales.findIndex(l => l.producto.idProducto === p.idProducto);

    if (idx >= 0) {

      actuales[idx] = { ...actuales[idx], cantidad: actuales[idx].cantidad + 1 };

    } else {

      actuales.push({ producto: p, cantidad: 1 });

    }



    this.lineas.set(actuales);

    this.error.set(null);



    if (p.idProducto != null) {

      this.ultimoFlashId.set(p.idProducto);

      setTimeout(() => {

        if (this.ultimoFlashId() === p.idProducto) this.ultimoFlashId.set(null);

      }, 550);

    }



    const restante = this.stockDisponible(p);

    const msg = restante <= 3 && restante > 0

      ? `${p.nombre} agregado · quedan ${restante}`

      : `${p.nombre} agregado`;

    this.toast.exito(msg);

  }



  agregarPrimero(): void {

    const list = this.productosVisibles();

    const disponible = list.find(p => !this.sinStock(p));

    if (disponible) this.agregar(disponible);

  }



  incrementar(idProducto?: number): void {

    if (!idProducto) return;

    const linea = this.lineas().find(l => l.producto.idProducto === idProducto);

    if (!linea) return;

    if (this.sinStock(linea.producto)) {

      this.toast.error('Stock insuficiente.');

      return;

    }

    this.cambiarCantidad(idProducto, linea.cantidad + 1);

  }



  decrementar(idProducto?: number): void {

    if (!idProducto) return;

    const linea = this.lineas().find(l => l.producto.idProducto === idProducto);

    if (!linea) return;

    this.cambiarCantidad(idProducto, linea.cantidad - 1);

  }



  cambiarCantidad(idProducto: number | undefined, qty: number): void {

    if (!idProducto) return;

    if (qty < 1) {

      this.quitarLinea(idProducto);

      return;

    }



    const linea = this.lineas().find(l => l.producto.idProducto === idProducto);

    if (linea && qty > (linea.producto.stock ?? 0)) {

      this.toast.error(`Stock máximo: ${linea.producto.stock}`);

      return;

    }



    this.lineas.set(this.lineas().map(l =>

      l.producto.idProducto === idProducto ? { ...l, cantidad: qty } : l,

    ));

  }



  quitarLinea(idProducto?: number): void {

    this.lineas.set(this.lineas().filter(l => l.producto.idProducto !== idProducto));

  }



  vaciar(): void {

    if (this.lineas().length === 0) return;

    this.lineas.set([]);

    this.error.set(null);

  }



  seleccionarConsumidorFinal(): void {

    const cf = this.clienteConsumidorFinal();

    if (cf?.idUsuario) {

      this.idCliente.set(cf.idUsuario);

      this.busquedaCliente.set('');

      this.error.set(null);

    } else {

      this.toast.error('No hay cliente genérico configurado.');

    }

  }



  cobrar(): void {

    if (!this.idCliente()) {

      this.error.set('Seleccioná un cliente o usá "Consumidor final".');

      this.toast.error('Falta seleccionar cliente.');

      return;

    }

    if (this.lineas().length === 0) {

      this.error.set('El carrito está vacío.');

      this.toast.error('Agregá productos al carrito.');

      return;

    }



    for (const l of this.lineas()) {

      if (l.cantidad > (l.producto.stock ?? 0)) {

        this.error.set(`Stock insuficiente: ${l.producto.nombre}`);

        this.toast.error(this.error()!);

        return;

      }

    }



    this.procesando.set(true);

    this.error.set(null);



    const lineasSnapshot = [...this.lineas()];

    const totalSnapshot = this.subtotal();

    const metodoSnapshot = this.metodoPago();

    const clienteNombre = this.clienteSeleccionado()?.nombre ?? 'Cliente';



    const request: ConfirmarOrdenRequest = {

      idUsuario: this.idCliente()!,

      lineas: lineasSnapshot.map(l => ({

        idProducto: l.producto.idProducto!,

        cantidad: l.cantidad,

      })),

      metodoPago: metodoSnapshot,

      tipoEntrega: 'RETIRO_TIENDA',

      canalOrigen: 'POS',

    };



    this.ordenVentaService.confirmar(request).subscribe({

      next: resp => {

        this.procesando.set(false);

        const pedidoId = resp.pedido.idPedido ?? 0;

        this.ventaExitosa.set({

          pedidoId,

          total: totalSnapshot,

          lineas: lineasSnapshot,

          metodoPago: metodoSnapshot,

          clienteNombre,

          fecha: new Date(),

        });

        this.lineas.set([]);

        this.toast.exito(`Venta registrada — Pedido #${pedidoId}`);

        this.productService.listarConFiltros({ canal: 'POS' }).subscribe(list =>
          this.productos.set(list.map(p => this.conPrecioCanal(p))),
        );

      },

      error: err => {

        this.procesando.set(false);

        const msg = err?.error?.message ?? err?.error?.mensaje;

        const texto = typeof msg === 'string' ? msg : 'Error al registrar la venta.';

        this.error.set(texto);

        this.toast.error(texto);

      },

    });

  }



  nuevaVenta(): void {

    this.ventaExitosa.set(null);

    this.error.set(null);

    this.focusBusqueda();

  }



  verPedido(): void {

    const v = this.ventaExitosa();

    if (v?.pedidoId) {

      this.router.navigate(['/admin/pedidos'], { queryParams: { detalle: v.pedidoId } });

    }

  }



  imprimirRecibo(): void {

    window.print();

  }



  focusBusqueda(): void {

    setTimeout(() => this.searchInput()?.nativeElement?.focus(), 50);

  }



  onSearchKeydown(event: KeyboardEvent): void {

    if (event.key === 'Enter') {

      event.preventDefault();

      this.agregarPrimero();

    }

  }



  @HostListener('document:keydown', ['$event'])

  onGlobalKeydown(event: KeyboardEvent): void {

    if (event.key === 'F2') {

      event.preventDefault();

      this.focusBusqueda();

      return;

    }

    if (event.key === 'Escape') {

      if (this.ventaExitosa()) {

        this.nuevaVenta();

        return;

      }

      this.limpiarBusqueda();

      this.busquedaCliente.set('');

    }

  }



  conPrecioCanal(p: Product): Product {
    if (p.precioCanal != null) {
      return { ...p, precio: p.precioCanal };
    }
    return p;
  }

  lineaSubtotal(l: LineaPos): number {

    return l.producto.precio * l.cantidad;

  }



  stockRestanteLinea(l: LineaPos): number {

    return Math.max(0, (l.producto.stock ?? 0) - l.cantidad);

  }

}


