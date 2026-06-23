import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { PlanCuotasService } from '../../services/plan-cuotas.service';
import { PerfilService } from '../../services/perfil.service';
import { PedidoService } from '../../services/pedido.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { PlanCuotas, PerfilCliente, Pedido } from '../../models/models';

// Pagina del modulo de Planes de cuotas (financiacion de un pedido).
@Component({
  selector: 'app-planes',
  imports: [FormsModule, DecimalPipe, AdminSearch],
  templateUrl: './planes.html',
})
export class Planes implements OnInit {

  items = signal<PlanCuotas[]>([]);
  clientes = signal<PerfilCliente[]>([]);
  pedidos = signal<Pedido[]>([]);
  busqueda = signal('');

  itemsFiltrados = computed(() => {
    const q = this.busqueda();
    return this.items().filter(p =>
      coincideBusqueda(q,
        p.idPlan,
        p.pedido?.idPedido,
        p.cliente?.usuario?.nombre,
        p.cliente?.usuario?.email,
        p.cantidadCuotas,
        p.interes,
        p.estado,
      ),
    );
  });

  clienteSeleccionado = signal<number | undefined>(undefined)

  // Formulario. El estado por defecto es ACTIVO.
  form: PlanCuotas = {
    cliente: { idCliente: undefined } as PerfilCliente,
    pedido: { idPedido: undefined } as Pedido,
    cantidadCuotas: 3,
    interes: 0,
    estado: 'ACTIVO',
  };

  // Signal computado: se recalcula solo cuando cambian "pedidos" o "clienteSeleccionado"
  pedidosFiltrados = computed(() => {
    const idCliente = this.clienteSeleccionado();
    if (!idCliente) return [];
    return this.pedidos().filter(p => p.usuario?.idUsuario === idCliente);
  });

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

  // Se ejecuta cada vez que el usuario cambia el select de cliente
  onClienteChange(idCliente: number | undefined): void {
    this.clienteSeleccionado.set(idCliente);
    this.form.pedido.idPedido = undefined; // resetea el pedido elegido, porque la lista cambió
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
