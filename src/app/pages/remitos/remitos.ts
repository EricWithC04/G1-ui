import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RemitoService } from '../../services/remito.service';
import { PedidoService } from '../../services/pedido.service';
import { PresupuestoService } from '../../services/presupuesto.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { Pedido, Presupuesto, Remito } from '../../models/models';

/**
 * Página `remitos`: pantalla Angular (componente + template) del módulo remitos.
 */
@Component({
  selector: 'app-remitos',
  imports: [FormsModule, RouterLink, DatePipe, AdminSearch],
  templateUrl: './remitos.html',
})
export class Remitos implements OnInit {
  items = signal<Remito[]>([]);
  pedidos = signal<Pedido[]>([]);
  presupuestos = signal<Presupuesto[]>([]);
  busqueda = signal('');
  pedidoId = signal<number | null>(null);
  presupuestoId = signal<number | null>(null);
  direccionEntrega = signal('');
  generando = signal(false);
  error = signal('');
  ok = signal('');

  itemsFiltrados = computed(() => {
    const q = this.busqueda();
    return this.items().filter(r =>
      coincideBusqueda(q,
        r.numeroRemito,
        r.idRemito,
        r.cliente?.usuario?.nombre,
        r.estado,
        r.direccionEntrega,
      ),
    );
  });

  constructor(
    private service: RemitoService,
    private pedidoService: PedidoService,
    private presupuestoService: PresupuestoService,
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.pedidoService.listar().subscribe(p => this.pedidos.set(p));
    this.presupuestoService.listar().subscribe(p => this.presupuestos.set(p));
  }

  cargar(): void {
    this.service.listar().subscribe(list => this.items.set(list));
  }

  generarDesdePedido(): void {
    const id = this.pedidoId();
    if (!id) {
      this.error.set('Seleccioná un pedido.');
      return;
    }
    this.generando.set(true);
    this.error.set('');
    this.service.generarDesdePedido(id, this.direccionEntrega() || undefined).subscribe({
      next: () => {
        this.generando.set(false);
        this.ok.set('Remito generado desde pedido.');
        this.pedidoId.set(null);
        this.cargar();
      },
      error: e => {
        this.generando.set(false);
        this.error.set(e.error?.message ?? 'Error al generar.');
      },
    });
  }

  generarDesdePresupuesto(): void {
    const id = this.presupuestoId();
    if (!id) {
      this.error.set('Seleccioná un presupuesto.');
      return;
    }
    this.generando.set(true);
    this.error.set('');
    this.service.generarDesdePresupuesto(id, this.direccionEntrega() || undefined).subscribe({
      next: () => {
        this.generando.set(false);
        this.ok.set('Remito generado desde presupuesto.');
        this.presupuestoId.set(null);
        this.cargar();
      },
      error: e => {
        this.generando.set(false);
        this.error.set(e.error?.message ?? 'Error al generar.');
      },
    });
  }

  badgeEstado(estado?: string): string {
    if (estado === 'ENTREGADO') return 'admin-badge admin-badge--emitida';
    if (estado === 'DESPACHADO') return 'admin-badge admin-badge--parcial';
    return 'admin-badge admin-badge--borrador';
  }
}
