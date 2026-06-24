import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { ClientePortalService } from '../../services/cliente-portal.service';
import { DetallePedido, Envio, PedidoDetalleResponse } from '../../models/models';

interface EtapaEnvio {
  id: string;
  nombre: string;
  descripcion: string;
  completada: boolean;
}

/**
 * Página `seguimiento-envio`: pantalla Angular (componente + template) del módulo seguimiento-envio.
 */
@Component({
  selector: 'app-seguimiento-envio',
  imports: [RouterLink, DecimalPipe, DatePipe, NgClass],
  templateUrl: './seguimiento-envio.html',
})
export class SeguimientoEnvio implements OnInit {

  private etapasBase: Omit<EtapaEnvio, 'completada'>[] = [
    { id: 'CONFIRMADO', nombre: 'Pedido confirmado', descripcion: 'Recibimos tu pedido y el pago fue aprobado.' },
    { id: 'PREPARACION', nombre: 'En preparación', descripcion: 'Estamos preparando tus productos en el depósito.' },
    { id: 'ENVIADO', nombre: 'Enviado', descripcion: 'Tu pedido salió del depósito hacia la empresa de logística.' },
    { id: 'EN_CAMINO', nombre: 'En camino', descripcion: 'El pedido está en camino a tu domicilio.' },
    { id: 'ENTREGADO', nombre: 'Entregado', descripcion: 'Tu pedido fue entregado con éxito.' },
  ];

  cargando = signal(true);
  error = signal<string | null>(null);
  detalle = signal<PedidoDetalleResponse | null>(null);

  etapas = computed<EtapaEnvio[]>(() => {
    const indice = this.indiceEtapaActual();
    return this.etapasBase.map((etapa, i) => ({
      ...etapa,
      completada: i <= indice,
    }));
  });

  indiceEtapaActual = computed(() => {
    const d = this.detalle();
    if (!d) return 0;
    const id = this.mapearEtapa(d.envio, d.pedido.estado);
    const idx = this.etapasBase.findIndex(e => e.id === id);
    return Math.max(0, idx);
  });

  progreso = computed(() => {
    const total = this.etapasBase.length - 1;
    if (total <= 0) return 0;
    return Math.round((this.indiceEtapaActual() / total) * 100);
  });

  entregado = computed(() => this.mapearEtapa(this.detalle()?.envio, this.detalle()?.pedido.estado) === 'ENTREGADO');

  constructor(
    private route: ActivatedRoute,
    private clientePortal: ClientePortalService,
  ) {}

  ngOnInit(): void {
    const pedidoId = Number(this.route.snapshot.paramMap.get('id'));
    if (!pedidoId || Number.isNaN(pedidoId)) {
      this.error.set('Pedido inválido.');
      this.cargando.set(false);
      return;
    }

    this.clientePortal.obtenerPedido(pedidoId).subscribe({
      next: d => {
        this.detalle.set(d);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No encontramos ese pedido o no tenés permiso para verlo.');
        this.cargando.set(false);
      },
    });
  }

  lineas(): DetallePedido[] {
    return this.detalle()?.detalles ?? [];
  }

  envio(): Envio | undefined {
    return this.detalle()?.envio;
  }

  private mapearEtapa(envio?: Envio, pedidoEstado?: string): string {
    if (envio?.estadoEnvio) {
      const e = envio.estadoEnvio.toUpperCase().replace(/ /g, '_');
      if (e === 'ENTREGADO') return 'ENTREGADO';
      if (e === 'EN_CAMINO') return 'EN_CAMINO';
      if (e === 'ENVIADO') return 'ENVIADO';
      if (e === 'PREPARANDO' || e === 'EN_PREPARACION') return 'PREPARACION';
    }
    if (pedidoEstado === 'PAGADO' || pedidoEstado === 'CONFIRMADO') return 'CONFIRMADO';
    return 'CONFIRMADO';
  }
}
