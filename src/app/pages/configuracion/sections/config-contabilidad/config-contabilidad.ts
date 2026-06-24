import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { ConfigModuloService, ContabilidadResumen } from '../../../../services/config-modulo.service';

type TabId = 'empresa' | 'iva' | 'resumen';

/**
 * Página `config-contabilidad`: pantalla Angular (componente + template) del módulo configuracion.
 */
@Component({
  selector: 'app-config-contabilidad',
  imports: [ConfigPageShell, FormsModule],
  templateUrl: './config-contabilidad.html',
})
export class ConfigContabilidad implements OnInit {
  tab = signal<TabId>('resumen');
  data = signal<ContabilidadResumen | null>(null);
  cargando = signal(false);
  mensaje = signal('');

  constructor(private configModulo: ConfigModuloService) {}

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    this.cargando.set(true);
    this.configModulo.contabilidadResumen().subscribe({
      next: d => { this.data.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  restaurar(): void {
    this.cargando.set(true);
    this.configModulo.restaurarContabilidad().subscribe({
      next: d => {
        this.data.set(d);
        this.mensaje.set('Catálogos Argentina restaurados');
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  valorConfig(clave: string): string {
    const cfg = this.data()?.config ?? [];
    return cfg.find(c => c.clave === clave)?.valor ?? '';
  }
}
