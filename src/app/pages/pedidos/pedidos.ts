import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { UsuarioService } from '../../services/usuario.service';
import { Pedido, Usuario } from '../../models/models';

// Pagina del modulo de Pedidos (las compras de los clientes).
@Component({
  selector: 'app-pedidos',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './pedidos.html',
})
export class Pedidos implements OnInit {

  items = signal<Pedido[]>([]);
  usuarios = signal<Usuario[]>([]);

  // Formulario: usuario que compra, estado y total. La fecha la pone el backend.
  form: Pedido = { usuario: { idUsuario: undefined } as Usuario, estado: 'PENDIENTE', total: 0 };

  constructor(
    private service: PedidoService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.usuarioService.listar().subscribe(data => this.usuarios.set(data));
  }

  cargar(): void {
    this.service.listar().subscribe(data => this.items.set(data));
  }

  guardar(): void {
    this.service.crear(this.form).subscribe({
      next: () => {
        this.form = { usuario: { idUsuario: undefined } as Usuario, estado: 'PENDIENTE', total: 0 };
        this.cargar();
      },
      error: err => console.error('Error al crear pedido', err),
    });
  }

  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: err => console.error('Error al borrar pedido', err),
    });
  }
}
