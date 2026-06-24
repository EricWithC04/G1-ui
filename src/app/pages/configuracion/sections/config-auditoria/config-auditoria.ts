import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, JsonPipe } from '@angular/common';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { ConfigModuloService } from '../../../../services/config-modulo.service';
import { RegistroAuditoria } from '../../../../models/models';

/**
 * Página `config-auditoria`: pantalla Angular (componente + template) del módulo configuracion.
 */
@Component({
  selector: 'app-config-auditoria',
  imports: [ConfigPageShell, FormsModule, DatePipe, JsonPipe],
  templateUrl: './config-auditoria.html',
})
export class ConfigAuditoria implements OnInit {
  registros = signal<RegistroAuditoria[]>([]);
  expandido = signal<number | null>(null);
  q = signal('');
  entidad = signal('');
  usuario = signal('');

  constructor(private configModulo: ConfigModuloService) {}

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.configModulo.auditoria({
      q: this.q() || undefined,
      entidad: this.entidad() || undefined,
      usuario: this.usuario() || undefined,
    }).subscribe(r => this.registros.set(r));
  }

  toggleExpand(id?: number): void {
    this.expandido.set(this.expandido() === id ? null : id ?? null);
  }

  parseJson(texto?: string): unknown {
    if (!texto) return null;
    try { return JSON.parse(texto); } catch { return texto; }
  }
}
