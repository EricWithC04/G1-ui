/**
 * Utilidad frontend `canal-origen`: helpers puros (validación, formato, exportación).
 */
export const CANALES_ORIGEN = [
  'WEB',
  'ADMIN',
  'WHATSAPP',
  'EMAIL',
  'INSTAGRAM',
  'FACEBOOK',
  'POS',
] as const;

export type CanalOrigen = (typeof CANALES_ORIGEN)[number];

export const CANAL_ORIGEN_LABEL: Record<string, string> = {
  WEB: 'Web',
  ADMIN: 'Admin',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  POS: 'Mostrador',
};

export const TIPO_ENTREGA_LABEL: Record<string, string> = {
  ENVIO: 'Envío',
  RETIRO_TIENDA: 'Retiro en tienda',
};

export function normalizarCanalOrigen(canal?: string | null, fallback: CanalOrigen = 'ADMIN'): CanalOrigen {
  const v = (canal ?? '').trim().toUpperCase();
  if ((CANALES_ORIGEN as readonly string[]).includes(v)) {
    return v as CanalOrigen;
  }
  return fallback;
}

export function labelCanalOrigen(canal?: string | null): string {
  if (!canal) return '—';
  return CANAL_ORIGEN_LABEL[canal.toUpperCase()] ?? canal;
}

export function labelTipoEntrega(tipo?: string | null): string {
  if (!tipo) return '—';
  return TIPO_ENTREGA_LABEL[tipo.toUpperCase()] ?? tipo;
}
