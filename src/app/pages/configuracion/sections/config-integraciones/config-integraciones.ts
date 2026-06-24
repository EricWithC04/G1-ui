import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { IntegracionService } from '../../../../services/conversacion.service';
import { IntegracionCanal } from '../../../../models/models';

const CANALES = [
  { tipo: 'WHATSAPP', nombre: 'WhatsApp Business', guia: 'Configurá el token de Meta Business y el número verificado.' },
  { tipo: 'INSTAGRAM', nombre: 'Instagram', guia: 'Conectá la cuenta comercial vía Meta Graph API.' },
  { tipo: 'FACEBOOK', nombre: 'Facebook Messenger', guia: 'Vinculá la página de Facebook y permisos de mensajería.' },
  { tipo: 'EMAIL', nombre: 'Email IMAP', guia: 'Servidor IMAP/SMTP para bandeja omnicanal.' },
  { tipo: 'EMAIL_GRAPH', nombre: 'Email Microsoft Graph', guia: 'OAuth Microsoft 365 para correo corporativo.' },
  { tipo: 'N8N', nombre: 'n8n Webhooks', guia: 'URL de webhook para automatizaciones externas.' },
];

/**
 * Página `config-integraciones`: pantalla Angular (componente + template) del módulo configuracion.
 */
@Component({
  selector: 'app-config-integraciones',
  imports: [ConfigPageShell, FormsModule],
  templateUrl: './config-integraciones.html',
})
export class ConfigIntegraciones implements OnInit {
  integraciones = signal<IntegracionCanal[]>([]);
  mensaje = signal('');

  filas = computed(() =>
    CANALES.map(c => ({
      meta: c,
      integracion: this.integraciones().find(i => i.tipo === c.tipo) ?? {
        tipo: c.tipo,
        nombre: c.nombre,
        activo: false,
        estadoConexion: 'NO_CONFIGURADO',
      } as IntegracionCanal,
    })),
  );

  constructor(private integracionService: IntegracionService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.integracionService.listar().subscribe(d => this.integraciones.set(d));
  }

  estadoBadge(estado?: string): string {
    if (estado === 'CONECTADO') return 'admin-badge--emitida';
    if (estado === 'ERROR') return 'admin-badge--vencida';
    if (estado === 'PENDIENTE') return 'admin-badge--pendiente';
    return 'admin-badge--borrador';
  }

  estadoLabel(estado?: string): string {
    if (estado === 'CONECTADO') return 'CONECTADO';
    if (estado === 'ERROR') return 'ERROR';
    if (estado === 'PENDIENTE') return 'PENDIENTE';
    return 'NO_CONFIGURADO';
  }

  toggleActivo(i: IntegracionCanal): void {
    if (!i.idIntegracion) {
      this.mensaje.set('Canal aún no configurado en el servidor');
      return;
    }
    this.integracionService.actualizar(i.idIntegracion, { ...i, activo: !i.activo }).subscribe({
      next: () => { this.mensaje.set('Integración actualizada'); this.cargar(); },
    });
  }

  conectar(i: IntegracionCanal): void {
    if (!i.idIntegracion) {
      this.mensaje.set('Canal aún no configurado en el servidor');
      return;
    }
    const nuevoEstado = i.estadoConexion === 'CONECTADO' ? 'DESCONECTADO' : 'CONECTADO';
    this.integracionService.actualizar(i.idIntegracion, { ...i, estadoConexion: nuevoEstado }).subscribe({
      next: () => { this.mensaje.set(nuevoEstado === 'CONECTADO' ? 'Canal conectado' : 'Canal desconectado'); this.cargar(); },
    });
  }

  copiarWebhook(): void {
    const url = `${window.location.origin}/api/webhooks/n8n`;
    navigator.clipboard.writeText(url).then(() => this.mensaje.set('URL copiada al portapapeles'));
  }
}
