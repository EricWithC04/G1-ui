export interface TipoClienteOption {
  value: string;
  label: string;
}

/** Tipos de cliente NovaTech Store (tech retail B2B+B2C). */
export const TIPOS_CLIENTE: TipoClienteOption[] = [
  { value: 'CONSUMIDOR_FINAL', label: 'Consumidor final' },
  { value: 'EMPRESA', label: 'Empresa (PYME / oficina)' },
  { value: 'CORPORATIVO', label: 'Corporativo' },
  { value: 'MAYORISTA', label: 'Revendedor / mayorista' },
  { value: 'INSTITUCION_EDUCATIVA', label: 'Institución educativa' },
  { value: 'OTRO', label: 'Otro' },
];

export const TIPO_CLIENTE_DEFAULT = 'CONSUMIDOR_FINAL';

export const TIPOS_CLIENTE_VALORES = TIPOS_CLIENTE.map(t => t.value);

export function labelTipoCliente(value?: string | null): string {
  if (!value) return '—';
  return TIPOS_CLIENTE.find(t => t.value === value)?.label ?? value;
}

export function displayTipoCliente(value?: string | null): string {
  if (!value) return 'Cliente';
  return TIPOS_CLIENTE.find(t => t.value === value)?.label ?? value;
}
