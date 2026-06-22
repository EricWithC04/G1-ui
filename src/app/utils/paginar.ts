/** Utilidades de paginación client-side para listas admin. */

export const PAGE_SIZE_DEFAULT = 15;
export const PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const;

export function paginar<T>(items: readonly T[], pagina: number, tamano: number): T[] {
  if (tamano <= 0 || items.length === 0) return [...items];
  const inicio = (Math.max(1, pagina) - 1) * tamano;
  return items.slice(inicio, inicio + tamano);
}

export function totalPaginas(total: number, tamano: number): number {
  if (total <= 0) return 1;
  return Math.ceil(total / Math.max(1, tamano));
}

export function rangoPagina(pagina: number, tamano: number, total: number): { desde: number; hasta: number } {
  if (total === 0) return { desde: 0, hasta: 0 };
  const desde = (Math.max(1, pagina) - 1) * tamano + 1;
  const hasta = Math.min(pagina * tamano, total);
  return { desde, hasta };
}
