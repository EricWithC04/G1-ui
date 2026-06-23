import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { Envio, Pedido, PedidoDetalleResponse } from '../../models/models';

@Component({
  selector: 'app-mis-pedidos',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './mis-pedidos.html',
})
export class MisPedidos implements OnInit {

  pedidos = signal<Pedido[]>([]);
  detallesPorPedido = signal<Map<number, PedidoDetalleResponse>>(new Map());
  cargando = signal(true);

  constructor(
    private pedidoService: PedidoService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const usuario = this.auth.getUsuario();
    if (!usuario) {
      this.cargando.set(false);
      return;
    }

    this.pedidoService.listar().subscribe(todos => {
      const mios = todos.filter(p => p.usuario?.idUsuario === usuario.idUsuario);
      mios.sort((a, b) => (b.idPedido ?? 0) - (a.idPedido ?? 0));
      this.pedidos.set(mios);
      this.cargando.set(false);

      if (mios.length > 0) {
        forkJoin(
          mios
            .filter(p => p.idPedido != null)
            .map(p => this.pedidoService.obtenerDetalle(p.idPedido!))
        ).subscribe(detalles => {
          const map = new Map<number, PedidoDetalleResponse>();
          detalles.forEach(d => {
            if (d.pedido.idPedido != null) {
              map.set(d.pedido.idPedido, d);
            }
          });
          this.detallesPorPedido.set(map);
        });
      }
    });
  }

  detalleDePedido(idPedido: number | undefined) {
    if (idPedido == null) return undefined;
    return this.detallesPorPedido().get(idPedido);
  }

  envioDePedido(idPedido: number | undefined): Envio | undefined {
    return this.detalleDePedido(idPedido)?.envio;
  }

  /** 0=Confirmado, 1=Preparando, 2=En camino, 3=Entregado */
  pasoTimeline(idPedido: number | undefined): number {
    const envio = this.envioDePedido(idPedido);
    if (!envio?.estadoEnvio) {
      return 0;
    }
    const estado = envio.estadoEnvio.toUpperCase().replace(' ', '_');
    switch (estado) {
      case 'ENTREGADO':
        return 3;
      case 'EN_CAMINO':
        return 2;
      case 'PREPARANDO':
        return 1;
      default:
        return 0;
    }
  }

  badgeEstado(pedido: Pedido): string {
    const envio = this.envioDePedido(pedido.idPedido);
    if (envio?.estadoEnvio) {
      return envio.estadoEnvio.replace('_', ' ');
    }
    return pedido.estado ?? 'PENDIENTE';
  }
}
