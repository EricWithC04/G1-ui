import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnvioService } from '../../services/envio.service';
import { PedidoService } from '../../services/pedido.service';
import { Envio, Pedido } from '../../models/models';

// Pagina del modulo de Envios (el seguimiento de entrega de cada pedido).
@Component({
  selector: 'app-envios',
  imports: [FormsModule],
  templateUrl: './envios.html',
})
export class Envios implements OnInit {

  items = signal<Envio[]>([]);
  pedidos = signal<Pedido[]>([]);

  // Formulario. El estado por defecto es PREPARANDO.
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
    this.service.listar().subscribe(data => this.items.set(data));
  }

  guardar(): void {
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
      next: () => this.cargar(),
      error: err => console.error('Error al borrar envio', err),
    });
  }
}
