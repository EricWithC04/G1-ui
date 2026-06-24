import { Product } from '../models/models';

/**
 * Utilidad frontend `stock-inventario.util`: helpers puros (validación, formato, exportación).
 */
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

export function sinStock(p: Product): boolean {
  return stockActual(p) === 0;
}

export interface EtiquetaStock {
  texto: string;
  clase: string;
  punto: 'green' | 'amber' | 'red';
}

export function etiquetaStock(p: Product): EtiquetaStock {
  if (sinStock(p)) {
    return { texto: 'Sin stock', clase: 'text-red-500/70', punto: 'red' };
  }
  if (esStockBajo(p)) {
    const n = stockActual(p);
    return {
      texto: n === 1 ? 'Última unidad' : `Últimas ${n} unidades`,
      clase: 'text-amber-500/70',
      punto: 'amber',
    };
  }
  const n = stockActual(p);
  return {
    texto: `En stock (${n} disponibles)`,
    clase: 'text-green-500/70',
    punto: 'green',
  };
}
