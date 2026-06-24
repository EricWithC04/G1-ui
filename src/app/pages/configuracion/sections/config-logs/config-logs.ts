import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, JsonPipe } from '@angular/common';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { ConfigModuloService } from '../../../../services/config-modulo.service';
import { LogSistema } from '../../../../models/models';

/**
 * Página `config-logs`: pantalla Angular (componente + template) del módulo configuracion.
 */
@Component({
  selector: 'app-config-logs',
  imports: [ConfigPageShell, FormsModule, DatePipe, JsonPipe],
  templateUrl: './config-logs.html',
})
export class ConfigLogs implements OnInit {
  registros = signal<LogSistema[]>([]);
  expandido = signal<number | null>(null);
  nivel = signal('');
  origen = signal('');
  q = signal('');
  diaSeleccionado = signal<number | null>(null);

  readonly dias = Array.from({ length: 15 }, (_, i) => i);

  constructor(private configModulo: ConfigModuloService) {}

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.configModulo.logs({
      nivel: this.nivel() || undefined,
      origen: this.origen() || undefined,
      q: this.q() || undefined,
      dias: 15,
    }).subscribe(r => this.registros.set(r));
  }

  registrosFiltrados = computed(() => {
    const dia = this.diaSeleccionado();
    if (dia == null) return this.registros();
    const target = new Date();
    target.setDate(target.getDate() - dia);
    const key = target.toISOString().slice(0, 10);
    return this.registros().filter(l => l.fecha?.startsWith(key));
  });

  toggleExpand(id?: number): void {
    this.expandido.set(this.expandido() === id ? null : id ?? null);
  }

  etiquetaDia(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  }

  parseJson(texto?: string): unknown {
    if (!texto) return null;
    try { return JSON.parse(texto); } catch { return texto; }
  }
}
