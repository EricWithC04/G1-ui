/** Validaciones compartidas del panel administrativo. */

export const PATRON_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PATRON_CUIT = /^\d{2}-\d{8}-\d{1}$/;
export const PATRON_TELEFONO = /^[\d\s+\-()]{8,20}$/;

export function esEmailValido(valor: string | null | undefined): boolean {
  if (!valor?.trim()) return false;
  return PATRON_EMAIL.test(valor.trim());
}

export function esCuitValido(valor: string | null | undefined): boolean {
  if (!valor?.trim()) return false;
  return PATRON_CUIT.test(valor.trim());
}

export function esEnteroNoNegativo(valor: unknown): boolean {
  if (valor === null || valor === undefined || valor === '') return false;
  const n = Number(valor);
  return Number.isFinite(n) && Number.isInteger(n) && n >= 0;
}

export function esEnteroPositivo(valor: unknown): boolean {
  return esEnteroNoNegativo(valor) && Number(valor) > 0;
}

export function esPorcentaje(valor: string | null | undefined): boolean {
  if (valor === null || valor === undefined || valor === '') return false;
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 && n <= 100;
}

export function esNumeroPositivo(valor: unknown): boolean {
  if (valor === null || valor === undefined || valor === '') return false;
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0;
}

export function aEntero(valor: unknown): number {
  return Math.max(0, Math.floor(Number(valor) || 0));
}

export function mensajeEmail(): string {
  return 'Ingresá un email válido (ej: usuario@empresa.com).';
}

export function mensajeCuit(): string {
  return 'CUIT con formato XX-XXXXXXXX-X.';
}

export function mensajeEntero(campo: string): string {
  return `${campo} debe ser un número entero sin decimales.`;
}
