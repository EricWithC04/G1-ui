import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Patrones alineados con el backend (ValidationPatterns). */
export const PATRON_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PATRON_TELEFONO = /^[\d\s+\-()]{8,20}$/;
export const PATRON_NOMBRE =
  /^[\p{L}][\p{L}\p{N} '\-]{0,98}[\p{L}\p{N}]$|^[\p{L}]{2,100}$/u;
export const PATRON_CUIT = /^\d{2}-\d{8}-\d{1}$/;
export const PATRON_METODO_PAGO =
  /^(TARJETA|EFECTIVO|TRANSFERENCIA|MERCADO_PAGO|BILLETERA_VIRTUAL|QR|PRESTAMO_CASA|CONTRA_ENTREGA)$/;
export const PATRON_TIPO_ENTREGA = /^(ENVIO|RETIRO_TIENDA)$/;
export const PATRON_CANAL_ORIGEN =
  /^(WEB|ADMIN|WHATSAPP|EMAIL|INSTAGRAM|FACEBOOK|POS)$/;
export const PATRON_TARJETA_NUMERO = /^[\d\s-]{13,19}$/;
export const PATRON_VENCIMIENTO_TARJETA = /^(0[1-9]|1[0-2])\/\d{2}$/;

export function esEmailValido(valor: string | null | undefined): boolean {
  if (!valor?.trim()) return false;
  return PATRON_EMAIL.test(valor.trim());
}

export function esTelefonoValido(valor: string | null | undefined): boolean {
  if (!valor?.trim()) return false;
  return PATRON_TELEFONO.test(valor.trim());
}

export function esNombreValido(valor: string | null | undefined): boolean {
  if (!valor?.trim()) return false;
  const limpio = valor.trim();
  if (limpio.length < 2 || limpio.length > 100) return false;
  return PATRON_NOMBRE.test(limpio);
}

export function esCuitValido(valor: string | null | undefined): boolean {
  if (!valor?.trim()) return false;
  return PATRON_CUIT.test(valor.trim());
}

export function esTarjetaNumero(valor: string | null | undefined): boolean {
  if (!valor?.trim()) return false;
  const digits = valor.replace(/\D/g, '');
  return digits.length >= 13 && digits.length <= 19 && PATRON_TARJETA_NUMERO.test(valor.trim());
}

export function esVencimientoTarjeta(valor: string | null | undefined): boolean {
  if (!valor?.trim()) return false;
  if (!PATRON_VENCIMIENTO_TARJETA.test(valor.trim())) return false;
  const [mm, yy] = valor.trim().split('/').map(Number);
  const now = new Date();
  const exp = new Date(2000 + yy, mm, 0);
  return exp >= new Date(now.getFullYear(), now.getMonth(), 1);
}

export function esTextoRequerido(valor: string | null | undefined, min = 1): boolean {
  return (valor?.trim().length ?? 0) >= min;
}

export function mensajeEmail(): string {
  return 'Ingresá un email válido (ej: usuario@empresa.com).';
}

export function mensajeTelefono(): string {
  return 'Teléfono inválido (8–20 dígitos, espacios, +, - o paréntesis).';
}

export function mensajeNombre(): string {
  return 'Nombre inválido (2–100 caracteres, letras y números).';
}

export function mensajeCuit(): string {
  return 'CUIT con formato XX-XXXXXXXX-X.';
}

export function mensajeTarjetaNumero(): string {
  return 'Número de tarjeta inválido (13–19 dígitos).';
}

export function mensajeVencimientoTarjeta(): string {
  return 'Vencimiento inválido (MM/AA, no vencida).';
}

export function mensajeTextoRequerido(campo: string, min = 1): string {
  return min > 1
    ? `${campo} debe tener al menos ${min} caracteres.`
    : `${campo} es obligatorio.`;
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    !control.value || esEmailValido(String(control.value)) ? null : { email: true };
}

export function telefonoValidator(opcional = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '').trim();
    if (!v) return opcional ? null : { telefono: true };
    return esTelefonoValido(v) ? null : { telefono: true };
  };
}

export function requiredTrimValidator(min = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    esTextoRequerido(String(control.value ?? ''), min) ? null : { requiredTrim: true };
}

export function nombreValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    !control.value || esNombreValido(String(control.value)) ? null : { nombre: true };
}

export function cuitValidator(opcional = true): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '').trim();
    if (!v) return opcional ? null : { cuit: true };
    return esCuitValido(v) ? null : { cuit: true };
  };
}

/** Primer mensaje de error del mapa `fields` del backend. */
export function primerErrorCampos(fields: Record<string, string> | undefined): string | null {
  if (!fields) return null;
  const values = Object.values(fields);
  return values.length > 0 ? values[0] : null;
}
