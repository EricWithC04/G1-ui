/** Normaliza texto para búsqueda insensible a mayúsculas y acentos. */
export function normalizarBusqueda(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Devuelve true si el término aparece en al menos uno de los valores. */
export function coincideBusqueda(
  termino: string,
  ...valores: (string | number | null | undefined)[]
): boolean {
  const q = normalizarBusqueda(termino);
  if (!q) return true;
  return valores.some(v => {
    if (v == null) return false;
    return normalizarBusqueda(String(v)).includes(q);
  });
}
