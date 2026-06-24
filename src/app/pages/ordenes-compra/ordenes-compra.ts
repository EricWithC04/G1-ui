import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdenCompraService } from '../../services/orden-compra.service';
import { OrdenCompra } from '../../models/models';

/**
 * Página `ordenes-compra`: pantalla Angular (componente + template) del módulo ordenes-compra.
 */
@Component({
  selector: 'app-ordenes-compra',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './ordenes-compra.html',
})
export class OrdenesCompra implements OnInit {
  items = signal<OrdenCompra[]>([]);
  ok = signal('');
  error = signal('');

  constructor(private service: OrdenCompraService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.listar().subscribe(list => this.items.set(list));
  }

  enviar(o: OrdenCompra): void {
    if (!o.idOrden) return;
    this.service.enviar(o.idOrden).subscribe({
      next: () => { this.ok.set('Orden enviada al proveedor.'); this.cargar(); },
      error: e => this.error.set(e.error?.message ?? 'Error'),
    });
  }

  recibir(o: OrdenCompra): void {
    if (!o.idOrden || !confirm('¿Marcar como recibida? Se sumará el stock automáticamente.')) return;
    this.service.recibir(o.idOrden).subscribe({
      next: () => { this.ok.set('Mercadería recibida — stock actualizado.'); this.cargar(); },
      error: e => this.error.set(e.error?.message ?? 'Error'),
    });
  }

  eliminar(o: OrdenCompra): void {
    if (!o.idOrden || !confirm('¿Eliminar orden?')) return;
    this.service.eliminar(o.idOrden).subscribe(() => this.cargar());
  }

  badge(estado?: string): string {
    if (estado === 'RECIBIDA') return 'admin-badge admin-badge--activa';
    if (estado === 'ENVIADA') return 'admin-badge admin-badge--enviada';
    if (estado === 'CANCELADA') return 'admin-badge admin-badge--vencida';
    return 'admin-badge admin-badge--borrador';
  }
}
