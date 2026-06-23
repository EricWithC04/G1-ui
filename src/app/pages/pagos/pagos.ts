import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PagoService } from '../../services/pago.service';
import { PedidoService } from '../../services/pedido.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { Pago, Pedido, Usuario } from '../../models/models';

@Component({
  selector: 'app-pagos',
  imports: [FormsModule, DatePipe, DecimalPipe, AdminSearch, RouterLink],
  templateUrl: './pagos.html',
})
export class Pagos implements OnInit {

  items = signal<Pago[]>([]);
  pedidos = signal<Pedido[]>([]);
  usuarios = signal<Usuario[]>([]);
  busqueda = signal('');
  filtroEstado = signal('');
  saldosPorPedido = signal<Map<number, number>>(new Map());
  pagoSeleccionado = signal<Pago | null>(null);
  cargando = signal(true);

  itemsFiltrados = computed(() => {
    const q = this.busqueda();
    const est = this.filtroEstado();
    return this.items().filter(p => {
      if (est && (p.estado ?? '').toUpperCase() !== est.toUpperCase()) return false;
      const pedido = this.pedidos().find(pd => pd.idPedido === p.pedido?.idPedido);
      return coincideBusqueda(q,
        p.idPago,
        p.pedido?.idPedido,
        pedido?.usuario?.nombre,
        pedido?.usuario?.email,
        p.monto,
        p.metodo,
        p.estado,
        p.referencia,
        p.fechaPago,
      );
    });
  });

  montoSeleccionado = signal<number>(0);
  saldoPedidoSeleccionado = signal<number>(0);

  form: Pago = {
    pedido: { idPedido: undefined } as Pedido,
    monto: 0,
    metodo: 'TARJETA',
    aprobadoPor: { idUsuario: undefined } as Usuario,
  };

  constructor(
    private service: PagoService,
    private pedidoService: PedidoService,
    private usuarioService: UsuarioService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const estado = params.get('estado');
      if (estado) this.filtroEstado.set(estado);
    });
    this.cargar();
    this.pedidoService.listar().subscribe(data => {
      this.pedidos.set(data);
      this.cargarSaldos(data);
    });
    this.usuarioService.listar().subscribe(data => {
      this.usuarios.set(data.filter(u => u.rol === 'ADMIN'));
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: data => {
        this.items.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  private cargarSaldos(pedidos: Pedido[]): void {
    const ids = pedidos.filter(p => p.idPedido != null).map(p => p.idPedido!);
    if (ids.length === 0) return;
    forkJoin(ids.map(id => this.pedidoService.obtenerDetalle(id))).subscribe(detalles => {
      const map = new Map<number, number>();
      detalles.forEach(d => {
        if (d.pedido.idPedido != null) {
          map.set(d.pedido.idPedido, d.saldoPendiente ?? 0);
        }
      });
      this.saldosPorPedido.set(map);
    });
  }

  saldoDePedido(idPedido?: number): number {
    if (idPedido == null) return 0;
    return this.saldosPorPedido().get(idPedido) ?? 0;
  }

  bloquearCaracteresInvalidos(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  onPedidoChange(idPedido: number) {
    const pedido = this.pedidos().find(p => p.idPedido === idPedido);
    this.montoSeleccionado.set(pedido?.total || 0);
    this.saldoPedidoSeleccionado.set(this.saldoDePedido(idPedido));
  }

  aprobarPago(pago: Pago): void {
    const admin = this.auth.getUsuario();
    if (!admin?.idUsuario || pago.idPago == null) return;
    this.service.aprobar(pago.idPago, admin.idUsuario).subscribe({
      next: () => {
        this.cargar();
        this.pedidoService.listar().subscribe(data => {
          this.pedidos.set(data);
          this.cargarSaldos(data);
        });
      },
      error: err => console.error('Error al aprobar pago', err),
    });
  }

  guardar(f: NgForm): void {
    if (f.invalid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.service.crear(this.form).subscribe({
      next: () => {
        this.form = {
          pedido: { idPedido: undefined } as Pedido,
          monto: 0, metodo: 'TARJETA',
          aprobadoPor: { idUsuario: undefined } as Usuario,
        };
        this.cargar();
        this.pedidoService.listar().subscribe(data => {
          this.pedidos.set(data);
          this.cargarSaldos(data);
        });
      },
      error: err => console.error('Error al crear pago', err),
    });
  }

  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => {
        if (this.pagoSeleccionado()?.idPago === id) this.pagoSeleccionado.set(null);
        this.cargar();
      },
      error: err => console.error('Error al borrar pago', err),
    });
  }

  verDetalle(p: Pago): void {
    this.pagoSeleccionado.set(p);
  }

  cerrarDetalle(): void {
    this.pagoSeleccionado.set(null);
  }

  pedidoDePago(p: Pago): Pedido | undefined {
    return this.pedidos().find(pd => pd.idPedido === p.pedido?.idPedido);
  }
}
