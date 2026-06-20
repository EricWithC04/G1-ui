import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PagoService } from '../../services/pago.service';
import { PedidoService } from '../../services/pedido.service';
import { UsuarioService } from '../../services/usuario.service';
import { Pago, Pedido, Usuario } from '../../models/models';

// Pagina del modulo de Pagos (los cobros de cada pedido).
@Component({
  selector: 'app-pagos',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './pagos.html',
})
export class Pagos implements OnInit {

  items = signal<Pago[]>([]);
  pedidos = signal<Pedido[]>([]);   // para elegir que pedido se paga
  usuarios = signal<Usuario[]>([]); // para elegir que admin lo aprobo

  // Formulario. fechaPago la pone el backend.
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
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.pedidoService.listar().subscribe(data => this.pedidos.set(data));
    this.usuarioService.listar().subscribe(data => {
      this.usuarios.set(data.filter(u => u.rol === 'ADMIN'));
    });
  }

  cargar(): void {
    this.service.listar().subscribe(data => this.items.set(data));
  }

  // Para que no se puedan colocar caracteres raros en los inputs de numeros
  bloquearCaracteresInvalidos(event: KeyboardEvent): void {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
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
      },
      error: err => console.error('Error al crear pago', err),
    });
  }

  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: err => console.error('Error al borrar pago', err),
    });
  }
}
