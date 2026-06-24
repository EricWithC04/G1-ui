import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { ConfiguracionService } from '../../../../services/configuracion.service';

/**
 * Página `config-notificaciones`: pantalla Angular (componente + template) del módulo configuracion.
 */
@Component({
  selector: 'app-config-notificaciones',
  imports: [ConfigPageShell, FormsModule],
  templateUrl: './config-notificaciones.html',
})
export class ConfigNotificaciones implements OnInit {
  campos = signal<{ clave: string; label: string; valor: string; tipo?: string }[]>([]);
  guardando = signal(false);
  mensaje = signal('');
  error = signal('');

  constructor(private configService: ConfiguracionService) {}

  ngOnInit(): void {
    this.configService.mapaGrupo('notificaciones').subscribe(mapa => {
      this.campos.set([
        { clave: 'email_alertas', label: 'Alertas por email', valor: mapa['email_alertas'] ?? 'false', tipo: 'checkbox' },
        { clave: 'email_remitente', label: 'Email remitente', valor: mapa['email_remitente'] ?? '' },
        { clave: 'whatsapp_alertas', label: 'Alertas WhatsApp', valor: mapa['whatsapp_alertas'] ?? 'false', tipo: 'checkbox' },
        { clave: 'dias_antes_vencimiento_cuota', label: 'Días antes de aviso de cuota', valor: mapa['dias_antes_vencimiento_cuota'] ?? '3', tipo: 'integer' },
        { clave: 'plantilla_cobranza_vencida', label: 'Plantilla cobranza vencida', valor: mapa['plantilla_cobranza_vencida'] ?? 'Su cuota vence pronto.' },
        { clave: 'plantilla_ot_sla', label: 'Plantilla OT SLA', valor: mapa['plantilla_ot_sla'] ?? 'Orden de trabajo fuera de SLA.' },
      ]);
    });
  }

  guardar(): void {
    const valores: Record<string, string> = {};
    for (const c of this.campos()) valores[c.clave] = c.valor;
    this.guardando.set(true);
    this.configService.guardarGrupo('notificaciones', valores).subscribe({
      next: () => { this.mensaje.set('Notificaciones guardadas'); this.guardando.set(false); },
      error: () => { this.error.set('Error al guardar'); this.guardando.set(false); },
    });
  }

  setCheckbox(c: { valor: string }, checked: boolean): void {
    c.valor = checked ? 'true' : 'false';
  }
}
