/** Validaciones compartidas del panel administrativo. */

export {
  PATRON_EMAIL,
  PATRON_CUIT,
  PATRON_TELEFONO,
  esEmailValido,
  esCuitValido,
  esTelefonoValido,
  esNombreValido,
  mensajeEmail,
  mensajeCuit,
  mensajeTelefono,
  mensajeNombre,
  emailValidator,
  telefonoValidator,
  requiredTrimValidator,
  cuitValidator,
  nombreValidator,
} from './validadores-form';

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
  return Number.isFinite(n) && n > 0;
}

export function aEntero(valor: unknown): number {
  return Math.max(0, Math.floor(Number(valor) || 0));
}

export function mensajeEntero(campo: string): string {
  return `${campo} debe ser un número entero sin decimales.`;
}
