import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { AdminPagination } from '../../components/admin-pagination/admin-pagination';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { descargarCsv } from '../../utils/export-csv';
import { paginar, PAGE_SIZE_DEFAULT } from '../../utils/paginar';
import {
  CANALES_ORIGEN,
  labelCanalOrigen,
  labelTipoEntrega,
} from '../../utils/canal-origen';
import { Pedido, PedidoDetalleResponse } from '../../models/models';

const ESTADOS_PEDIDO = ['', 'PENDIENTE', 'PARCIAL', 'PAGADO', 'ENVIADO', 'CANCELADO'];

@Component({
  selector: 'app-pedidos',
  imports: [FormsModule, DatePipe, DecimalPipe, AdminSearch, RouterLink, AdminPagination],
  templateUrl: './pedidos.html',
})
export class Pedidos implements OnInit {

  items = signal<Pedido[]>([]);
  busqueda = signal('');
  filtroCanal = signal('');
  filtroEstado = signal('');
  detalleSeleccionado = signal<PedidoDetalleResponse | null>(null);
  cargandoDetalle = signal(false);
  cargando = signal(true);
  error = signal('');
  pagina = signal(1);
  tamanoPagina = signal(PAGE_SIZE_DEFAULT);

  canales = ['', ...CANALES_ORIGEN];
  estados = ESTADOS_PEDIDO;

  labelCanal = labelCanalOrigen;
  labelEntrega = labelTipoEntrega;

  itemsFiltrados = computed(() => {
    const q = this.busqueda();
    return this.items().filter(p =>
      coincideBusqueda(q,
        p.idPedido,
        p.usuario?.nombre,
        p.usuario?.email,
        p.estado,
        p.total,
        p.fecha,
        p.canalOrigen,
        p.tipoEntrega,
      ),
    );
  });

  itemsPaginados = computed(() =>
    paginar(this.itemsFiltrados(), this.pagina(), this.tamanoPagina()),
  );

  constructor(
    private service: PedidoService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const estado = params.get('estado');
      if (estado) this.filtroEstado.set(estado);
      const detalle = params.get('detalle');
      if (detalle) this.verDetalle(+detalle);
      this.cargar();
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.listar(this.filtroCanal() || undefined, this.filtroEstado() || undefined)
      .subscribe({
        next: data => {
          this.items.set(data);
          this.cargando.set(false);
          this.pagina.set(1);
        },
        error: () => {
          this.cargando.set(false);
          this.error.set('No se pudieron cargar los pedidos.');
        },
      });
  }

  verDetalle(id?: number): void {
    if (id == null) return;
    this.cargandoDetalle.set(true);
    this.service.obtenerDetalle(id).subscribe({
      next: d => {
        this.detalleSeleccionado.set(d);
        this.cargandoDetalle.set(false);
      },
      error: () => {
        this.cargandoDetalle.set(false);
        this.detalleSeleccionado.set(null);
      },
    });
    Object.values(f.controls).forEach(c => c.markAsUntouched());
  }

  cerrarDetalle(): void {
    this.detalleSeleccionado.set(null);
  }

  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => {
        if (this.detalleSeleccionado()?.pedido.idPedido === id) {
          this.detalleSeleccionado.set(null);
        }
        this.cargar();
      },
    });
  }

  exportarCsv(): void {
    descargarCsv('pedidos', [
      { clave: 'id', encabezado: 'ID' },
      { clave: 'cliente', encabezado: 'Cliente' },
      { clave: 'fecha', encabezado: 'Fecha' },
      { clave: 'canal', encabezado: 'Canal' },
      { clave: 'estado', encabezado: 'Estado' },
      { clave: 'total', encabezado: 'Total' },
    ], this.itemsFiltrados().map(p => ({
      id: p.idPedido,
      cliente: p.usuario?.nombre ?? '',
      fecha: p.fecha ?? '',
      canal: p.canalOrigen ?? '',
      estado: p.estado ?? '',
      total: p.total,
    })));
  }
}
