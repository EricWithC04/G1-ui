import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EnvioService } from '../../services/envio.service';
import { PedidoService } from '../../services/pedido.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { Envio, EnvioDetalleResponse, Pedido } from '../../models/models';

@Component({
  selector: 'app-envios',
  imports: [FormsModule, AdminSearch, RouterLink],
  templateUrl: './envios.html',
})
export class Envios implements OnInit {

  items = signal<Envio[]>([]);
  pedidos = signal<Pedido[]>([]);
  busqueda = signal('');
  filtroEstado = signal('');
  detalle = signal<EnvioDetalleResponse | null>(null);
  cargandoDetalle = signal(false);
  cargando = signal(true);
  editTracking = signal('');
  editCosto = signal<number | null>(null);

  itemsFiltrados = computed(() => {
    const q = this.busqueda();
    const est = this.filtroEstado();
    return this.items().filter(e => {
      if (est && (e.estadoEnvio ?? '').toUpperCase() !== est.toUpperCase()) return false;
      return coincideBusqueda(q,
        e.idEnvio,
        e.pedido?.idPedido,
        e.pedido?.usuario?.nombre,
        e.pedido?.usuario?.email,
        e.direccionEnvio,
        e.empresaLogistica,
        e.estadoEnvio,
        e.numeroTracking,
      );
    });
  });

  form: Envio = {
    pedido: { idPedido: undefined } as Pedido,
    direccionEnvio: '',
    empresaLogistica: '',
    estadoEnvio: 'PREPARANDO',
  };

  constructor(
    private service: EnvioService,
    private pedidoService: PedidoService,
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.pedidoService.listar().subscribe(data => this.pedidos.set(data));
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

  guardar(f: NgForm): void {
    if (f.invalid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.service.crear(this.form).subscribe({
      next: () => {
        this.form = {
          pedido: { idPedido: undefined } as Pedido,
          direccionEnvio: '', empresaLogistica: '', estadoEnvio: 'PREPARANDO',
        };
        this.cargar();
      },
      error: err => console.error('Error al crear envio', err),
    });
  }

  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => {
        if (this.detalle()?.envio?.idEnvio === id) this.cerrarDetalle();
        this.cargar();
      },
      error: err => console.error('Error al borrar envio', err),
    });
  }

  verDetalle(e: Envio): void {
    if (!e.idEnvio) return;
    this.cargandoDetalle.set(true);
    this.service.obtenerDetalle(e.idEnvio).subscribe({
      next: data => {
        this.detalle.set(data);
        this.editTracking.set(data.envio?.numeroTracking ?? '');
        this.editCosto.set(data.envio?.costoEnvio ?? null);
        this.cargandoDetalle.set(false);
      },
      error: () => this.cargandoDetalle.set(false),
    });
  }

  cerrarDetalle(): void {
    this.detalle.set(null);
  }

  actualizarEstado(e: Envio, estado: string): void {
    if (!e.idEnvio) return;
    this.service.actualizar(e.idEnvio, { ...e, estadoEnvio: estado }).subscribe({
      next: () => {
        this.cargar();
        if (this.detalle()?.envio?.idEnvio === e.idEnvio) {
          this.verDetalle({ ...e, estadoEnvio: estado });
        }
      },
      error: err => console.error('Error al actualizar envío', err),
    });
  }

  guardarLogistica(): void {
    const d = this.detalle();
    const envio = d?.envio;
    if (!envio?.idEnvio) return;
    this.service.actualizar(envio.idEnvio, {
      ...envio,
      numeroTracking: this.editTracking(),
      costoEnvio: this.editCosto() ?? undefined,
    }).subscribe({
      next: () => {
        this.cargar();
        this.verDetalle(envio);
      },
      error: err => console.error('Error al guardar tracking', err),
    });
  }

  nombreCliente(e: Envio): string {
    return e.pedido?.usuario?.nombre ?? '—';
  }

  emailCliente(e: Envio): string {
    return e.pedido?.usuario?.email ?? '';
  }

  badgeEnvio(estado?: string): string {
    const e = (estado ?? '').toUpperCase();
    if (e === 'ENTREGADO') return 'admin-badge admin-badge--emitida';
    if (e === 'EN_CAMINO') return 'admin-badge admin-badge--enviada';
    return 'admin-badge admin-badge--pendiente';
  }

  formatMoney(v?: number | null): string {
    if (v == null) return '—';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v);
  }

  formatFecha(v?: string | null): string {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleString('es-AR');
  }
}
