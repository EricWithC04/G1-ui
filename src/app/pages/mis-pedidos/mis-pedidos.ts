import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PedidoService, DetallePedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { Pedido, DetallePedido } from '../../models/models';

// Pagina "Mis pedidos".
// Muestra los pedidos del usuario logueado. Como el backend no tiene un endpoint
// "pedidos por usuario", traemos TODOS los pedidos y filtramos por idUsuario aca,
// en el front. Igual hacemos con los detalles (renglones) para mostrar que se compro.
@Component({
  selector: 'app-mis-pedidos',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './mis-pedidos.html',
})
export class MisPedidos implements OnInit {

  // Pedidos del usuario.
  pedidos = signal<Pedido[]>([]);
  // Todos los detalles (renglones) traidos del backend, para agrupar por pedido.
  detalles = signal<DetallePedido[]>([]);
  // Estado de carga.
  cargando = signal(true);

  constructor(
    private pedidoService: PedidoService,
    private detalleService: DetallePedidoService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const usuario = this.auth.getUsuario();
    if (!usuario) {
      return;
    }

    // Traemos todos los pedidos y nos quedamos con los de este usuario.
    this.pedidoService.listar().subscribe(todos => {
      const mios = todos.filter(p => p.usuario?.idUsuario === usuario.idUsuario);
      // Ordenamos del mas nuevo al mas viejo (por id, que crece con el tiempo).
      mios.sort((a, b) => (b.idPedido ?? 0) - (a.idPedido ?? 0));
      this.pedidos.set(mios);
      this.cargando.set(false);
    });

    // Traemos los detalles para poder mostrar los productos de cada pedido.
    this.detalleService.listar().subscribe(ds => this.detalles.set(ds));
  }

  // Devuelve los renglones (productos) que pertenecen a un pedido dado.
  detallesDePedido(idPedido: number | undefined): DetallePedido[] {
    if (idPedido == null) {
      return [];
    }
    return this.detalles().filter(d => d.pedido?.idPedido === idPedido);
  }
}
