import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarLink {
  path: string;
  label: string;
  /** true solo para Dashboard (/admin exacto) */
  exact?: boolean;
}

export interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

/**
 * Navegación alineada al hub de Configuración: un link por área,
 * sin duplicar opciones que viven en /admin/configuracion/*.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  sections: SidebarSection[] = [
    {
      title: 'General',
      links: [
        { path: 'admin', label: 'Dashboard', exact: true },
        { path: 'admin/configuracion', label: 'Configuración' },
      ],
    },
    {
      title: 'Operaciones',
      links: [
        { path: 'admin/crm', label: 'CRM' },
        { path: 'admin/pedidos', label: 'Pedidos' },
        { path: 'admin/pos', label: 'POS mostrador' },
        { path: 'admin/pagos', label: 'Pagos' },
        { path: 'admin/envios', label: 'Envíos' },
      ],
    },
    {
      title: 'Catálogo',
      links: [
        { path: 'admin/productos', label: 'Productos' },
        { path: 'admin/listas-precios', label: 'Listas de precios' },
        { path: 'admin/ordenes-compra', label: 'Órdenes de compra' },
      ],
    },
    {
      title: 'Finanzas',
      links: [
        { path: 'admin/presupuestos', label: 'Presupuestos' },
        { path: 'admin/remitos', label: 'Remitos' },
        { path: 'admin/facturacion', label: 'Facturación' },
        { path: 'admin/creditos', label: 'Créditos y cuotas' },
      ],
    },
    {
      title: 'Marketing',
      links: [
        { path: 'admin/promociones', label: 'Promociones' },
        { path: 'admin/campanas', label: 'Campañas' },
      ],
    },
  ];

  linkActiveOptions(link: SidebarLink): { exact: boolean } {
    return { exact: link.exact ?? false };
  }
}
