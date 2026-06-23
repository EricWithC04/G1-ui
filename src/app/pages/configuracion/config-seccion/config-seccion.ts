import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ConfiguracionService } from '../../../services/configuracion.service';
import { IntegracionService } from '../../../services/conversacion.service';
import { IntegracionCanal, LogSistema, RegistroAuditoria } from '../../../models/models';

@Component({
  selector: 'app-config-seccion',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './config-seccion.html',
})
export class ConfigSeccion implements OnInit {
  titulo = signal('');
  grupo = signal('');
  campos = signal<{ clave: string; label: string; valor: string; tipo?: string }[]>([]);
  integraciones = signal<IntegracionCanal[]>([]);
  registrosAuditoria = signal<RegistroAuditoria[]>([]);
  registrosLogs = signal<LogSistema[]>([]);
  guardando = signal(false);
  ok = signal('');
  esIntegraciones = signal(false);
  esAuditoria = signal(false);
  esLogs = signal(false);

  constructor(
    private route: ActivatedRoute,
    private configService: ConfiguracionService,
    private integracionService: IntegracionService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const seccion = params.get('seccion') ?? '';
      this.configurarSeccion(seccion);
    });
  }

  private configurarSeccion(seccion: string): void {
    this.esIntegraciones.set(false);
    this.esAuditoria.set(false);
    this.esLogs.set(false);

    const map: Record<string, { titulo: string; grupo: string; campos: { clave: string; label: string; tipo?: string }[] }> = {
      contabilidad: {
        titulo: 'Contabilidad y Fiscal',
        grupo: 'contabilidad',
        campos: [
          { clave: 'iva_general', label: 'IVA general (%)' },
          { clave: 'iibb', label: 'IIBB (%)' },
          { clave: 'retenciones_activas', label: 'Retenciones activas', tipo: 'checkbox' },
        ],
      },
      afip: {
        titulo: 'Emisores / AFIP',
        grupo: 'afip',
        campos: [
          { clave: 'cuit_emisor', label: 'CUIT emisor' },
          { clave: 'punto_venta', label: 'Punto de venta' },
          { clave: 'certificado_vencimiento', label: 'Vencimiento certificado', tipo: 'date' },
        ],
      },
      plantillas: {
        titulo: 'Plantillas de impresión',
        grupo: 'plantillas',
        campos: [
          { clave: 'factura_encabezado', label: 'Encabezado factura' },
          { clave: 'presupuesto_pie', label: 'Pie de presupuesto' },
        ],
      },
      notificaciones: {
        titulo: 'Notificaciones',
        grupo: 'notificaciones',
        campos: [
          { clave: 'email_alertas', label: 'Alertas por email', tipo: 'checkbox' },
          { clave: 'whatsapp_alertas', label: 'Alertas WhatsApp', tipo: 'checkbox' },
        ],
      },
      seguridad: {
        titulo: 'Seguridad',
        grupo: 'seguridad',
        campos: [
          { clave: '2fa_obligatorio', label: '2FA obligatorio (admins)', tipo: 'checkbox' },
          { clave: 'sesion_horas', label: 'Duración sesión (horas)' },
        ],
      },
      auditoria: {
        titulo: 'Auditoría',
        grupo: 'auditoria',
        campos: [{ clave: 'retencion_dias', label: 'Retención auditoría (días)' }],
      },
      logs: {
        titulo: 'Logs del sistema',
        grupo: 'logs',
        campos: [{ clave: 'retencion_dias', label: 'Retención logs (días)' }],
      },
    };

    if (seccion === 'integraciones') {
      this.esIntegraciones.set(true);
      this.titulo.set('Integraciones');
      this.integracionService.listar().subscribe(i => this.integraciones.set(i));
      return;
    }

    if (seccion === 'auditoria') {
      this.esAuditoria.set(true);
      this.titulo.set('Auditoría');
      this.grupo.set('auditoria');
      this.configService.registrosAuditoria().subscribe(r => this.registrosAuditoria.set(r));
      this.configService.mapaGrupo('auditoria').subscribe(mapa => {
        this.campos.set([{ clave: 'retencion_dias', label: 'Retención auditoría (días)', valor: mapa['retencion_dias'] ?? '' }]);
      });
      return;
    }

    if (seccion === 'logs') {
      this.esLogs.set(true);
      this.titulo.set('Logs del sistema');
      this.grupo.set('logs');
      this.configService.registrosLogs().subscribe(r => this.registrosLogs.set(r));
      this.configService.mapaGrupo('logs').subscribe(mapa => {
        this.campos.set([{ clave: 'retencion_dias', label: 'Retención logs (días)', valor: mapa['retencion_dias'] ?? '' }]);
      });
      return;
    }

    if (seccion === 'usuarios-roles') {
      this.titulo.set('Usuarios y Roles');
      this.grupo.set('');
      this.campos.set([]);
      return;
    }

    if (seccion === 'catalogos') {
      this.titulo.set('Catálogos / Maestros');
      this.grupo.set('');
      this.campos.set([]);
      return;
    }

    const cfg = map[seccion];
    if (!cfg) return;
    this.titulo.set(cfg.titulo);
    this.grupo.set(cfg.grupo);
    this.esIntegraciones.set(false);
    this.configService.mapaGrupo(cfg.grupo).subscribe(mapa => {
      this.campos.set(
        cfg.campos.map(c => ({
          ...c,
          valor: mapa[c.clave] ?? '',
        })),
      );
    });
  }

  guardar(): void {
    const g = this.grupo();
    if (!g) return;
    const valores: Record<string, string> = {};
    for (const c of this.campos()) {
      valores[c.clave] = c.valor;
    }
    this.guardando.set(true);
    this.configService.guardarGrupo(g, valores).subscribe({
      next: () => {
        this.ok.set('Configuración guardada');
        this.guardando.set(false);
        setTimeout(() => this.ok.set(''), 3000);
      },
      error: () => this.guardando.set(false),
    });
  }

  toggleIntegracion(i: IntegracionCanal): void {
    if (!i.idIntegracion) return;
    this.integracionService
      .actualizar(i.idIntegracion, { activo: !i.activo })
      .subscribe(updated => {
        this.integraciones.update(list =>
          list.map(x => (x.idIntegracion === updated.idIntegracion ? updated : x)),
        );
      });
  }

  conectarIntegracion(i: IntegracionCanal): void {
    if (!i.idIntegracion) return;
    const estado = i.estadoConexion === 'CONECTADO' ? 'DESCONECTADO' : 'CONECTADO';
    this.integracionService.actualizar(i.idIntegracion, { estadoConexion: estado }).subscribe(updated => {
      this.integraciones.update(list =>
        list.map(x => (x.idIntegracion === updated.idIntegracion ? updated : x)),
      );
    });
  }
}
