/** Catálogo de listas de precio — alineado al backend. */
export const LISTAS_PRECIO = [
  { codigo: 'MAYORISTA', label: 'Mayorista / Revendedor', desc: 'Mejor precio — revendedores y volumen', color: '#22c55e' },
  { codigo: 'B2B', label: 'B2B / Empresa', desc: 'Empresas, instituciones, ventas CRM', color: '#3b82f6' },
  { codigo: 'ECOMMERCE', label: 'E-commerce', desc: 'Tienda web pública', color: '#f97316' },
  { codigo: 'LOCAL', label: 'Local / POS', desc: 'Mostrador físico', color: '#a855f7' },
] as const;

export type CodigoListaPrecio = (typeof LISTAS_PRECIO)[number]['codigo'];

/** Jerarquía: menor = más descuento permitido. */
export function jerarquiaLista(codigo: string): number {
  const map: Record<string, number> = { MAYORISTA: 1, B2B: 2, ECOMMERCE: 3, LOCAL: 4 };
  return map[codigo?.toUpperCase()] ?? 99;
}

export function labelLista(codigo: string): string {
  return LISTAS_PRECIO.find(l => l.codigo === codigo?.toUpperCase())?.label ?? codigo;
}
