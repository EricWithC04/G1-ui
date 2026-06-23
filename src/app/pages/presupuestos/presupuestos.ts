import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PresupuestoService } from '../../services/presupuesto.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { Presupuesto } from '../../models/models';

@Component({
  selector: 'app-presupuestos',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, AdminSearch],
  templateUrl: './presupuestos.html',
})
export class Presupuestos implements OnInit {
  items = signal<Presupuesto[]>([]);
  busqueda = signal('');
  filtroEstado = signal('');
  cargando = signal(true);

  itemsFiltrados = computed(() => {
    const q = this.busqueda();
    const est = this.filtroEstado();
    return this.items().filter(p => {
      if (est && (p.estado ?? '').toUpperCase() !== est.toUpperCase()) return false;
      return coincideBusqueda(q,
        p.numeroPresupuesto,
        p.idPresupuesto,
        p.cliente?.usuario?.nombre,
        p.cliente?.usuario?.email,
        p.estado,
        p.total,
        p.notas,
      );
    });
  });

  constructor(private service: PresupuestoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: list => {
        this.items.set(list);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  badgeEstado(estado?: string): string {
    if (estado === 'APROBADO') return 'admin-badge admin-badge--emitida';
    if (estado === 'FACTURADO') return 'admin-badge admin-badge--blue';
    if (estado === 'VENCIDO' || estado === 'ANULADA') return 'admin-badge admin-badge--vencida';
    if (estado === 'ENVIADO') return 'admin-badge admin-badge--enviada';
    return 'admin-badge admin-badge--borrador';
  }
}
