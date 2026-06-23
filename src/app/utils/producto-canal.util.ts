import { Product } from '../models/models';

/** Aplica precio de canal ECOMMERCE/POS como precio visible en storefront. */
export function normalizarPrecioCanal(p: Product): Product {
  if (p.precioCanal != null) {
    return { ...p, precio: p.precioCanal };
  }
  return p;
}

export function normalizarListaPrecioCanal(items: Product[]): Product[] {
  return items.map(normalizarPrecioCanal);
}

export const CANAL_ECOMMERCE = 'WEB';
