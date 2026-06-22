import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarLink {
  path: string;
  label: string;
  exact?: boolean;
}

export interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

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
        { path: 'admin', label: 'Dashboard' },
        { path: 'admin/configuracion', label: 'Configuración' },
      ],
    },
    {
      title: 'CRM y Marketing',
      links: [
        { path: 'admin/crm/bandeja', label: 'Bandeja omnicanal' },
        { path: 'admin/crm/clientes', label: 'Clientes CRM' },
        { path: 'admin/crm/embudo', label: 'Embudo de ventas' },
        { path: 'admin/promociones', label: 'Promociones' },
        { path: 'admin/campanas', label: 'Campañas y mensajes' },
      ],
    },
    {
      title: 'Catálogo',
      links: [
        { path: 'admin/productos', label: 'Productos' },
        { path: 'admin/ordenes-compra', label: 'Órdenes de compra' },
        { path: 'admin/categorias', label: 'Categorías' },
      ],
    },
    {
      title: 'Ventas y operaciones',
      links: [
        { path: 'admin/pedidos', label: 'Pedidos' },
        { path: 'admin/pagos', label: 'Pagos' },
        { path: 'admin/envios', label: 'Envíos' },
      ],
    },
    {
      title: 'Finanzas y crédito',
      links: [
        { path: 'admin/facturacion', label: 'Facturación' },
        { path: 'admin/creditos', label: 'Créditos y cuotas' },
        { path: 'admin/planes', label: 'Planes de cuotas' },
      ],
    },
    {
      title: 'Usuarios',
      links: [
        { path: 'admin/usuarios', label: 'Usuarios' },
        { path: 'admin/perfiles', label: 'Perfiles de cliente' },
      ],
    },
  ];
}
