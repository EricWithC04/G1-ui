import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { ConfigModuloService } from '../../../../services/config-modulo.service';
import { PermisoService } from '../../../../services/permiso.service';
import { PlantillaPrintService, PlantillaRenderResponse } from '../../../../services/plantilla-print.service';
import { PlantillaImpresion } from '../../../../models/models';

@Component({
  selector: 'app-config-plantillas',
  imports: [ConfigPageShell, FormsModule],
  templateUrl: './config-plantillas.html',
  styleUrl: './config-plantillas.css',
})
export class ConfigPlantillas implements OnInit {
  plantillas = signal<PlantillaImpresion[]>([]);
  seleccionada = signal<PlantillaImpresion | null>(null);
  mensaje = signal('');
  previews = signal<Record<number, PlantillaRenderResponse>>({});
  modalPreview = signal<PlantillaRenderResponse | null>(null);
  cargandoPreview = signal(false);

  defaultsPorTipo = computed(() => {
    const map = new Map<string, PlantillaImpresion>();
    for (const p of this.plantillas()) {
      if (p.esDefault && p.tipo && !map.has(p.tipo)) {
        map.set(p.tipo, p);
      }
    }
    return map;
  });

  constructor(
    private configModulo: ConfigModuloService,
    public permiso: PermisoService,
    private plantillaPrint: PlantillaPrintService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.configModulo.listarPlantillas().subscribe(list => {
      this.plantillas.set(list);
      this.cargarPreviews(list);
    });
  }

  cargarPreviews(list: PlantillaImpresion[]): void {
    const defaults = list.filter(p => p.esDefault && p.idPlantilla != null);
    for (const p of defaults) {
      this.plantillaPrint.previewPlantilla(p.idPlantilla!).subscribe({
        next: res => {
          this.previews.update(prev => ({ ...prev, [p.idPlantilla!]: res }));
        },
      });
    }
  }

  previewHtml(id?: number): SafeHtml | null {
    if (id == null) return null;
    const res = this.previews()[id];
    if (!res?.html) return null;
    const css = res.css ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(
      `<style>${css}</style><div class="plantilla-thumb-inner">${res.html}</div>`,
    );
  }

  previewCompleto(res: PlantillaRenderResponse): SafeHtml | null {
    if (!res.html) return null;
    return this.sanitizer.bypassSecurityTrustHtml(
      `<style>${res.css ?? ''}</style>${res.html}`,
    );
  }

  abrirModal(p: PlantillaImpresion): void {
    const cached = p.idPlantilla != null ? this.previews()[p.idPlantilla] : undefined;
    if (cached) {
      this.modalPreview.set(cached);
      return;
    }
    if (p.idPlantilla == null) return;
    this.cargandoPreview.set(true);
    this.plantillaPrint.previewPlantilla(p.idPlantilla).subscribe({
      next: res => {
        this.previews.update(prev => ({ ...prev, [p.idPlantilla!]: res }));
        this.modalPreview.set(res);
        this.cargandoPreview.set(false);
      },
      error: () => this.cargandoPreview.set(false),
    });
  }

  cerrarModal(): void {
    this.modalPreview.set(null);
  }

  editar(p: PlantillaImpresion): void {
    this.seleccionada.set({ ...p });
  }

  guardar(): void {
    const p = this.seleccionada();
    if (!p?.idPlantilla) return;
    this.configModulo.actualizarPlantilla(p.idPlantilla, p).subscribe({
      next: () => {
        this.mensaje.set('Plantilla guardada');
        this.cargar();
      },
    });
  }

  duplicar(id?: number): void {
    if (id == null) return;
    this.configModulo.duplicarPlantilla(id).subscribe({
      next: () => {
        this.mensaje.set('Plantilla duplicada');
        this.cargar();
      },
    });
  }

  marcarDefault(p: PlantillaImpresion): void {
    this.configModulo.actualizarPlantilla(p.idPlantilla!, { ...p, esDefault: true }).subscribe({
      next: () => {
        this.mensaje.set('Plantilla predeterminada');
        this.cargar();
      },
    });
  }
}
