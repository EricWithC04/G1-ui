import { Product } from '../models/models';

export const STOCK_MINIMO_DEFAULT = 5;

export function stockMinimoEfectivo(p: Product): number {
  return p.stockMinimo != null && p.stockMinimo > 0 ? p.stockMinimo : STOCK_MINIMO_DEFAULT;
}

export function stockActual(p: Product): number {
  return p.stock ?? 0;
}

export function esStockBajo(p: Product): boolean {
  return stockActual(p) <= stockMinimoEfectivo(p);
}
