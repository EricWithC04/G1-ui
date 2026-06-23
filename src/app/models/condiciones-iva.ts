export interface CondicionIvaOption {
  value: string;
  label: string;
}

/** Condiciones IVA AFIP / Argentina (retail B2B). Valores almacenados en PerfilCliente.condicionIva. */
export const CONDICIONES_IVA: CondicionIvaOption[] = [
  { value: 'RESPONSABLE_INSCRIPTO', label: 'Responsable inscripto' },
  { value: 'MONOTRIBUTO', label: 'Monotributo' },
  { value: 'EXENTO', label: 'Exento' },
  { value: 'SUJETO_EXENTO', label: 'Sujeto exento' },
  { value: 'CONSUMIDOR_FINAL', label: 'Consumidor final' },
  { value: 'IVA_NO_ALCANZADO', label: 'IVA no alcanzado' },
];

export const CONDICIONES_IVA_VALORES = CONDICIONES_IVA.map(c => c.value);

const LEGACY_ALIASES: Record<string, string> = {
  'responsable inscripto': 'RESPONSABLE_INSCRIPTO',
  monotributo: 'MONOTRIBUTO',
  exento: 'EXENTO',
  'sujeto exento': 'SUJETO_EXENTO',
  'consumidor final': 'CONSUMIDOR_FINAL',
  'iva no alcanzado': 'IVA_NO_ALCANZADO',
};

export function labelCondicionIva(value?: string | null): string {
  if (!value) return '—';
  const code = normalizarCondicionIva(value);
  return CONDICIONES_IVA.find(c => c.value === code)?.label ?? value;
}

/** Convierte texto legado o código a valor canónico del catálogo. */
export function normalizarCondicionIva(value?: string | null): string | undefined {
  if (!value?.trim()) return undefined;
  const trimmed = value.trim();
  if (CONDICIONES_IVA_VALORES.includes(trimmed)) return trimmed;
  const alias = LEGACY_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;
  const byLabel = CONDICIONES_IVA.find(
    c => c.label.toLowerCase() === trimmed.toLowerCase(),
  );
  return byLabel?.value ?? trimmed;
}

/** Consumidor final → CF; resto de tipos comerciales → Responsable inscripto. */
export function defaultCondicionIvaPorTipoCliente(tipo?: string | null): string {
  return tipo === 'CONSUMIDOR_FINAL' ? 'CONSUMIDOR_FINAL' : 'RESPONSABLE_INSCRIPTO';
}
