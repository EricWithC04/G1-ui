import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConversacionService } from '../../services/conversacion.service';
import { ClienteCrmService } from '../../services/cliente-crm.service';
import { UsuarioService } from '../../services/usuario.service';
import { ConfiguracionService } from '../../services/configuracion.service';
import { PermisoService } from '../../services/permiso.service';
import { esRolPanelAdmin } from '../../config/config-rbac';
import {
  ClienteHistorial,
  Conversacion,
  MensajeConversacion,
  PerfilCliente,
  Usuario,
} from '../../models/models';

const CANAL_ICON: Record<string, string> = {
  EMAIL: '✉️',
  FACEBOOK: 'f',
  INSTAGRAM: '📷',
  WHATSAPP: '💬',
};

const CANAL_LABEL: Record<string, string> = {
  EMAIL: 'Correo IMAP/SMTP',
  FACEBOOK: 'Facebook Messenger',
  INSTAGRAM: 'Instagram Direct',
  WHATSAPP: 'WhatsApp Business',
};

/**
 * Página `crm-bandeja`: pantalla Angular (componente + template) del módulo crm-bandeja.
 */
@Component({
  selector: 'app-crm-bandeja',
  imports: [FormsModule, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './crm-bandeja.html',
  styleUrl: './crm-bandeja.css',
})
export class CrmBandeja implements OnInit {
  conversaciones = signal<Conversacion[]>([]);
  sel = signal<Conversacion | null>(null);
  mensajes = signal<MensajeConversacion[]>([]);
  usuarios = signal<Usuario[]>([]);
  clientes = signal<PerfilCliente[]>([]);
  historial = signal<ClienteHistorial | null>(null);
  busqueda = signal('');
  filtroCanal = signal('');
  filtroEstado = signal('');
  respuesta = signal('');
  guardando = signal(false);
  mostrarProspecto = signal(false);
  pendienteEnvio = signal('');
  etiquetasDisponibles = signal<string[]>([
    'venta', 'soporte', 'reclamo', 'presupuesto', 'urgente', 'preventivo',
    'calibracion', 'repuesto', 'visita_tecnica', 'garantia',
  ]);
  private seleccionPendienteId = signal<number | null>(null);

  canales = ['', 'WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'EMAIL'];
  estados = ['', 'PENDIENTE', 'EN_PROCESO', 'RESUELTA'];

  puedeAsignar = computed(() => this.permiso.puede('crm.assign'));
  puedeResponder = computed(() => this.permiso.puede('crm.reply'));

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      this.seleccionPendienteId.set(id ? +id : null);
      this.cargar();
    });
    this.usuarioService.listar().subscribe(u =>
      this.usuarios.set(u.filter(x => esRolPanelAdmin(x.rol))),
    );
    this.clienteCrm.listar().subscribe(c => this.clientes.set(c));
    this.configService.mapaGrupo('crm').subscribe(mapa => {
      const raw = mapa['etiquetas_conversacion'];
      if (raw) {
        this.etiquetasDisponibles.set(raw.split(',').map(t => t.trim()).filter(Boolean));
      }
    });
  }

  constructor(
    private conversacionService: ConversacionService,
    private clienteCrm: ClienteCrmService,
    private usuarioService: UsuarioService,
    private configService: ConfiguracionService,
    private route: ActivatedRoute,
    public permiso: PermisoService,
  ) {}

  cargar(): void {
    this.conversacionService
      .listar(this.filtroCanal() || undefined, this.filtroEstado() || undefined, this.busqueda() || undefined)
      .subscribe(lista => {
        this.conversaciones.set(lista);
        const pendienteId = this.seleccionPendienteId();
        if (pendienteId) {
          const target = lista.find(c => c.idConversacion === pendienteId);
          if (target) {
            this.seleccionar(target);
            this.seleccionPendienteId.set(null);
            return;
          }
          this.conversacionService.obtener(pendienteId).subscribe({
            next: conv => {
              this.seleccionar(conv);
              this.seleccionPendienteId.set(null);
            },
            error: () => this.aplicarSeleccionPorDefecto(lista),
          });
          return;
        }
        this.aplicarSeleccionPorDefecto(lista);
      });
  }

  private aplicarSeleccionPorDefecto(lista: Conversacion[]): void {
    const actual = this.sel();
    if (actual?.idConversacion) {
      const refreshed = lista.find(c => c.idConversacion === actual.idConversacion);
      if (refreshed) this.seleccionar(refreshed);
    } else if (lista.length && !actual) {
      this.seleccionar(lista[0]);
    }
  }

  seleccionar(c: Conversacion): void {
    this.sel.set(c);
    if (!c.idConversacion) return;
    this.conversacionService.mensajes(c.idConversacion).subscribe(m => this.mensajes.set(m));
    if (c.cliente?.idCliente) {
      this.clienteCrm.historial(c.cliente.idCliente).subscribe(h => this.historial.set(h));
    } else {
      this.historial.set(null);
    }
  }

  iconoCanal(canal?: string): string {
    return CANAL_ICON[canal ?? ''] ?? '•';
  }

  labelCanal(canal?: string): string {
    return CANAL_LABEL[canal ?? ''] ?? canal ?? '';
  }

  etiquetasActivas = computed(() => {
    const tags = this.sel()?.etiquetas ?? '';
    return tags.split(',').map(t => t.trim()).filter(Boolean);
  });

  toggleEtiqueta(tag: string): void {
    if (!this.puedeAsignar()) return;
    const c = this.sel();
    if (!c?.idConversacion) return;
    const actuales = new Set(this.etiquetasActivas());
    if (actuales.has(tag)) actuales.delete(tag);
    else actuales.add(tag);
    const etiquetas = [...actuales].join(',');
    this.conversacionService.actualizar(c.idConversacion, { etiquetas }).subscribe(updated => {
      this.sel.set(updated);
      this.cargar();
    });
  }

  cambiarAsignado(idUsuario: number): void {
    if (!this.puedeAsignar()) return;
    const c = this.sel();
    if (!c?.idConversacion) return;
    this.conversacionService
      .actualizar(c.idConversacion, { asignadoA: { idUsuario } as Usuario })
      .subscribe(updated => {
        this.sel.set(updated);
        this.cargar();
      });
  }

  vincularCliente(idCliente: number): void {
    const c = this.sel();
    if (!c?.idConversacion) return;
    this.conversacionService
      .actualizar(c.idConversacion, { cliente: { idCliente } as PerfilCliente })
      .subscribe(updated => {
        this.sel.set(updated);
        this.seleccionar(updated);
        this.cargar();
      });
  }

  enviar(): void {
    if (!this.puedeResponder()) return;
    const c = this.sel();
    const texto = this.respuesta().trim();
    if (!c?.idConversacion || !texto) return;
    this.guardando.set(true);
    this.pendienteEnvio.set('');
    this.conversacionService.enviar(c.idConversacion, texto).subscribe({
      next: () => {
        this.respuesta.set('');
        this.conversacionService.mensajes(c.idConversacion!).subscribe(m => this.mensajes.set(m));
        this.cargar();
        this.guardando.set(false);
        this.pendienteEnvio.set('Mensaje guardado. Si el canal está desconectado, queda pendiente de envío.');
      },
      error: () => this.guardando.set(false),
    });
  }

  cambiarEstado(estado: string): void {
    if (!this.puedeAsignar()) return;
    const c = this.sel();
    if (!c?.idConversacion) return;
    this.conversacionService.actualizar(c.idConversacion, { estado }).subscribe(updated => {
      this.sel.set(updated);
      this.cargar();
    });
  }

  crearPedidoQueryParams(): Record<string, string> {
    const c = this.sel();
    if (!c) return {};
    const params: Record<string, string> = {};
    if (c.cliente?.usuario?.idUsuario) {
      params['idUsuario'] = String(c.cliente.usuario.idUsuario);
    }
    if (c.canal) {
      params['canalOrigen'] = c.canal;
    }
    const notas = (c.asunto || c.vistaPrevia || '').trim();
    if (notas) params['notas'] = notas;
    if (!c.cliente?.usuario?.idUsuario && c.contactoNombre) {
      params['contacto'] = c.contactoNombre;
    }
    return params;
  }

  conectarCanales(): void {
    window.open('/admin/configuracion/integraciones', '_self');
  }
}
