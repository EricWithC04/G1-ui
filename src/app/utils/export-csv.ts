/** Exportación CSV UTF-8 con BOM para Excel. */

export interface ColumnaCsv {
  clave: string;
  encabezado: string;
}

function escapar(valor: unknown): string {
  if (valor == null) return '';
  const s = String(valor).replace(/"/g, '""');
  return /[",;\n\r]/.test(s) ? `"${s}"` : s;
}

export function descargarCsv(
  nombreArchivo: string,
  columnas: ColumnaCsv[],
  filas: Record<string, unknown>[],
): void {
  const sep = ';';
  const lineas = [
    columnas.map(c => escapar(c.encabezado)).join(sep),
    ...filas.map(f =>
      columnas.map(c => escapar(f[c.clave])).join(sep),
    ),
  ];
  const bom = '\uFEFF';
  const blob = new Blob([bom + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
