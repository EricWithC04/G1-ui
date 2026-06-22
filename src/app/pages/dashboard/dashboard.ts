import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardKpi } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

  kpis = signal<DashboardKpi | null>(null);
  cargando = signal(true);
  error = signal('');

  modulos = [
    { path: 'admin/configuracion', titulo: 'Configuración', desc: 'Usuarios, fiscal, integraciones…', grupo: 'Sistema' },
    { path: 'admin/crm', titulo: 'CRM', desc: 'Clientes y bandeja omnicanal', grupo: 'Operaciones' },
    { path: 'admin/pedidos', titulo: 'Pedidos', desc: 'Ventas y órdenes', grupo: 'Operaciones' },
    { path: 'admin/facturacion', titulo: 'Facturación', desc: 'Comprobantes fiscales', grupo: 'Finanzas' },
    { path: 'admin/creditos', titulo: 'Créditos', desc: 'Cuotas y morosidad', grupo: 'Finanzas' },
    { path: 'admin/productos', titulo: 'Productos', desc: 'Catálogo de la tienda', grupo: 'Catálogo' },
    { path: 'admin/promociones', titulo: 'Promociones', desc: 'Ofertas activas', grupo: 'Marketing' },
    { path: 'admin/campanas', titulo: 'Campañas', desc: 'Mensajes automáticos', grupo: 'Marketing' },
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.kpis().subscribe({
      next: data => {
        this.kpis.set(data);
        this.cargando.set(false);
        this.error.set('');
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar los indicadores. Verificá la conexión con el backend.');
      },
    });
  }

  badgePedido(estado?: string): string {
    if (estado === 'PAGADO') return 'admin-badge admin-badge--activa';
    if (estado === 'PENDIENTE' || estado === 'PARCIAL') return 'admin-badge admin-badge--pendiente';
    if (estado === 'CANCELADO') return 'admin-badge admin-badge--vencida';
    return 'admin-badge admin-badge--borrador';
  }

  badgeFactura(estado?: string): string {
    if (estado === 'EMITIDA') return 'admin-badge admin-badge--emitida';
    if (estado === 'ANULADA') return 'admin-badge admin-badge--vencida';
    return 'admin-badge admin-badge--borrador';
  }

  barColor(estado: string): string {
    const map: Record<string, string> = {
      PAGADO: 'dash-bar--emerald',
      PENDIENTE: 'dash-bar--amber',
      PARCIAL: 'dash-bar--blue',
      ENVIADO: 'dash-bar--violet',
      CANCELADO: 'dash-bar--rose',
    };
    return map[estado] ?? 'dash-bar--slate';
  }
}
