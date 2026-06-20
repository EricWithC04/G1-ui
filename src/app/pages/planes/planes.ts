import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { PlanCuotasService } from '../../services/plan-cuotas.service';
import { PerfilService } from '../../services/perfil.service';
import { PedidoService } from '../../services/pedido.service';
import { PlanCuotas, PerfilCliente, Pedido } from '../../models/models';

// Pagina del modulo de Planes de cuotas (financiacion de un pedido).
@Component({
  selector: 'app-planes',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './planes.html',
})
export class Planes implements OnInit {

  items = signal<PlanCuotas[]>([]);
  clientes = signal<PerfilCliente[]>([]); // perfiles de cliente para el desplegable
  pedidos = signal<Pedido[]>([]);

  // Formulario. El estado por defecto es ACTIVO.
  form: PlanCuotas = {
    cliente: { idCliente: undefined } as PerfilCliente,
    pedido: { idPedido: undefined } as Pedido,
    cantidadCuotas: 3,
    interes: 0,
    estado: 'ACTIVO',
  };

  constructor(
    private service: PlanCuotasService,
    private perfilService: PerfilService,
    private pedidoService: PedidoService,
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.perfilService.listar().subscribe(data => this.clientes.set(data));
    this.pedidoService.listar().subscribe(data => this.pedidos.set(data));
  }

  // Para que no se puedan colocar caracteres raros en los inputs de numeros
  bloquearCaracteresInvalidos(event: KeyboardEvent): void {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
}

  cargar(): void {
    this.service.listar().subscribe(data => this.items.set(data));
  }

  guardar(f: NgForm): void {
    if (f.invalid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.service.crear(this.form).subscribe({
      next: () => {
        this.form = {
          cliente: { idCliente: undefined } as PerfilCliente,
          pedido: { idPedido: undefined } as Pedido,
          cantidadCuotas: 3, interes: 0, estado: 'ACTIVO',
        };
        this.cargar();
      },
      error: err => console.error('Error al crear plan', err),
    });
  }

  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: err => console.error('Error al borrar plan', err),
    });
  }
}
