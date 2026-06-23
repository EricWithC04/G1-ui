/** Catálogo RBAC — alineado a iBiomédica ERP (adaptado a NovaTech). */

export const WILDCARD = '*';

export interface ConfigHubItem {
  path: string;
  titulo: string;
  desc: string;
  icon: string;
  permiso: string;
  disponible: boolean;
}

export const CONFIG_HUB_ITEMS: ConfigHubItem[] = [
  { path: 'usuarios', titulo: 'Usuarios y Roles', desc: 'Altas, roles y permisos del equipo', icon: 'users', permiso: 'usuarios.read', disponible: true },
  { path: 'contabilidad', titulo: 'Contabilidad y Fiscal', desc: 'IVA, IIBB, retenciones, plan de cuentas — Argentina', icon: 'settings', permiso: 'config.manage_accounting', disponible: true },
  { path: 'emisores', titulo: 'Emisores / AFIP', desc: 'CUITs, puntos de venta y certificados', icon: 'building', permiso: 'emisores.read', disponible: true },
  { path: 'plantillas', titulo: 'Plantillas de impresión', desc: 'Factura, presupuesto y remito editables', icon: 'file', permiso: 'config.manage_billing_templates', disponible: true },
  { path: 'integraciones', titulo: 'Integraciones', desc: 'WhatsApp, Instagram, Facebook, correo y n8n', icon: 'plug', permiso: 'config.manage_integrations', disponible: true },
  { path: 'catalogos', titulo: 'Catálogos / Maestros', desc: 'Categorías de tienda, depósitos, condiciones de pago', icon: 'boxes', permiso: 'config.update', disponible: true },
  { path: 'notificaciones', titulo: 'Notificaciones', desc: 'Plantillas y reglas de aviso', icon: 'bell', permiso: 'config.update', disponible: true },
  { path: 'seguridad', titulo: 'Seguridad', desc: 'Contraseñas, 2FA y sesiones', icon: 'shield', permiso: 'config.update', disponible: true },
  { path: 'auditoria', titulo: 'Auditoría', desc: 'Registro de cambios del sistema', icon: 'history', permiso: 'auditoria.read', disponible: true },
  { path: 'logs', titulo: 'Logs del sistema', desc: 'Errores técnicos (15 días de retención)', icon: 'terminal', permiso: 'logs.read', disponible: true },
];

/** Permisos mínimos del módulo configuración. */
export const CONFIG_PERMISSIONS = [
  'usuarios.read', 'usuarios.create', 'usuarios.update', 'usuarios.deactivate', 'usuarios.assign_roles',
  'clientes.read', 'clientes.create', 'clientes.update', 'clientes.deactivate', 'clientes.export',
  'crm.read', 'crm.reply', 'crm.assign', 'crm.manage_channels',
  'emisores.read', 'emisores.create', 'emisores.update', 'emisores.delete',
  'config.read', 'config.update', 'config.manage_accounting', 'config.manage_integrations', 'config.manage_billing_templates',
  'auditoria.read', 'logs.read',
  'pedidos.read', 'pedidos.create', 'pedidos.update',
  'productos.read', 'productos.create', 'productos.update',
  'facturacion.read', 'facturacion.create',
  'pagos.read', 'pagos.approve',
  'envios.read', 'envios.update',
] as const;

export type ConfigPermission = typeof CONFIG_PERMISSIONS[number];

/** Mapa rol → permisos estáticos (fallback hasta cargar matriz API). */
export const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  SUPERADMIN: [WILDCARD],
  ADMIN: [WILDCARD],
  GERENTE: CONFIG_PERMISSIONS,
  VENDEDOR: [
    'clientes.read', 'clientes.create', 'clientes.update', 'crm.read', 'crm.reply', 'config.read', 'usuarios.read',
    'pedidos.read', 'pedidos.create', 'pedidos.update',
    'productos.read', 'pagos.read', 'pagos.approve', 'envios.read', 'facturacion.read',
  ],
  CLIENTE: [],
};

export function esRolConAccesoTotal(rol: string | null | undefined): boolean {
  return rol === 'SUPERADMIN' || rol === 'ADMIN';
}

export function esRolPanelAdmin(rol: string | null | undefined): boolean {
  if (!rol) return false;
  if (esRolConAccesoTotal(rol)) return true;
  return rol !== 'CLIENTE';
}

export function permisosDeRol(rol: string | null | undefined): Set<string> {
  if (!rol) return new Set();
  const list = ROLE_PERMISSIONS[rol] ?? [];
  if (list.includes(WILDCARD)) return new Set([WILDCARD, ...CONFIG_PERMISSIONS]);
  return new Set(list);
}

export function tienePermiso(rol: string | null | undefined, permiso: string): boolean {
  const set = permisosDeRol(rol);
  return set.has(WILDCARD) || set.has(permiso);
}
