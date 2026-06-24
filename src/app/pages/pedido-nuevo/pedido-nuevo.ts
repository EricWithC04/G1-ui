import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { UsuarioService } from '../../services/usuario.service';
import { OrdenVentaService } from '../../services/orden-venta.service';
import { ConfirmarOrdenRequest, Product, Usuario } from '../../models/models';
import {
  CANALES_ORIGEN,
  CanalOrigen,
  labelCanalOrigen,
  normalizarCanalOrigen,
} from '../../utils/canal-origen';

interface LineaCarrito {
  producto: Product;
  cantidad: number;
}

/**
 * Página `pedido-nuevo`: pantalla Angular (componente + template) del módulo pedido-nuevo.
 */
@Component({
  selector: 'app-pedido-nuevo',
  imports: [FormsModule, DecimalPipe, RouterLink],
  templateUrl: './pedido-nuevo.html',
})
export class PedidoNuevo implements OnInit {
  usuarios = signal<Usuario[]>([]);
  productos = signal<Product[]>([]);
  busquedaProducto = signal('');
  lineas = signal<LineaCarrito[]>([]);

  idUsuario = signal<number | null>(null);
  contactoNombre = signal('');
  canalOrigen = signal<CanalOrigen>('ADMIN');
  notas = signal('');
  metodoPago = signal('EFECTIVO');
  tipoEntrega = signal<'ENVIO' | 'RETIRO_TIENDA'>('RETIRO_TIENDA');
  direccionEnvio = signal('');

  procesando = signal(false);
  error = signal<string | null>(null);
  exito = signal(false);
  pedidoId = signal<number | null>(null);

  canales = CANALES_ORIGEN;
  metodosPago = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CONTRA_ENTREGA', 'PRESTAMO_CASA'];

  productosFiltrados = computed(() => {
    const q = this.busquedaProducto().trim().toLowerCase();
    if (!q) return this.productos().slice(0, 12);
    return this.productos().filter(p =>
      (p.nombre ?? '').toLowerCase().includes(q)
      || String(p.idProducto ?? '').includes(q)
      || (p.proveedor ?? '').toLowerCase().includes(q),
    ).slice(0, 20);
  });

  subtotal = computed(() =>
    this.lineas().reduce((acc, l) => acc + l.producto.precio * l.cantidad, 0),
  );

  labelCanal = labelCanalOrigen;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private usuarioService: UsuarioService,
    private ordenVentaService: OrdenVentaService,
  ) {}

  ngOnInit(): void {
    this.usuarioService.listar().subscribe(list =>
      this.usuarios.set(list.filter(u => u.rol === 'CLIENTE')),
    );
    this.productService.listar().subscribe(list => this.productos.set(list));

    this.route.queryParamMap.subscribe(params => {
      const idUsr = params.get('idUsuario');
      if (idUsr) this.idUsuario.set(+idUsr);
      this.canalOrigen.set(normalizarCanalOrigen(params.get('canalOrigen'), 'ADMIN'));
      if (params.get('notas')) this.notas.set(params.get('notas')!);
      if (params.get('contacto')) this.contactoNombre.set(params.get('contacto')!);
    });
  }

  agregarProducto(p: Product): void {
    const actuales = [...this.lineas()];
    const idx = actuales.findIndex(l => l.producto.idProducto === p.idProducto);
    if (idx >= 0) {
      actuales[idx] = { ...actuales[idx], cantidad: actuales[idx].cantidad + 1 };
    } else {
      actuales.push({ producto: p, cantidad: 1 });
    }
    this.lineas.set(actuales);
    this.error.set(null);
  }

  quitarLinea(idProducto?: number): void {
    this.lineas.set(this.lineas().filter(l => l.producto.idProducto !== idProducto));
  }

  cambiarCantidad(idProducto: number | undefined, cantidad: number): void {
    if (!idProducto || cantidad < 1) return;
    this.lineas.set(this.lineas().map(l =>
      l.producto.idProducto === idProducto ? { ...l, cantidad } : l,
    ));
  }

  confirmar(): void {
    const idUsr = this.idUsuario();
    if (!idUsr) {
      this.error.set('Seleccioná un cliente para el pedido.');
      return;
    }
    if (this.lineas().length === 0) {
      this.error.set('Agregá al menos un producto.');
      return;
    }
    if (this.tipoEntrega() === 'ENVIO' && !this.direccionEnvio().trim()) {
      this.error.set('Ingresá la dirección de envío.');
      return;
    }

    this.procesando.set(true);
    this.error.set(null);

    const request: ConfirmarOrdenRequest = {
      idUsuario: idUsr,
      lineas: this.lineas().map(l => ({
        idProducto: l.producto.idProducto!,
        cantidad: l.cantidad,
      })),
      metodoPago: this.metodoPago(),
      tipoEntrega: this.tipoEntrega(),
      canalOrigen: this.canalOrigen(),
      direccionEnvio: this.tipoEntrega() === 'ENVIO' ? this.direccionEnvio().trim() : undefined,
      notas: this.armarNotas(),
    };

    this.ordenVentaService.confirmar(request).subscribe({
      next: resp => {
        this.procesando.set(false);
        this.exito.set(true);
        this.pedidoId.set(resp.pedido.idPedido ?? null);
      },
      error: err => {
        this.procesando.set(false);
        const msg = err?.error?.message ?? err?.error?.mensaje;
        this.error.set(typeof msg === 'string' ? msg : 'No se pudo confirmar el pedido.');
      },
    });
  }

  private armarNotas(): string | undefined {
    const partes: string[] = [];
    const base = this.notas().trim();
    if (base) partes.push(base);
    const contacto = this.contactoNombre().trim();
    if (contacto) partes.push('Contacto CRM: ' + contacto);
    return partes.length ? partes.join(' · ') : undefined;
  }

  irAlPedido(): void {
    const id = this.pedidoId();
    if (id) this.router.navigate(['/admin/pedidos'], { queryParams: { detalle: id } });
    else this.router.navigate(['/admin/pedidos']);
  }
}
