import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PlantillaRenderResponse {
  html?: string;
  css?: string;
  idPlantilla?: number;
  tipo?: string;
}

@Injectable({ providedIn: 'root' })
export class PlantillaPrintService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/config/plantillas`;

  previewPlantilla(id: number): Observable<PlantillaRenderResponse> {
    return this.http.get<PlantillaRenderResponse>(`${this.base}/${id}/preview`);
  }

  previewTipo(tipo: string): Observable<PlantillaRenderResponse> {
    return this.http.get<PlantillaRenderResponse>(`${this.base}/preview/${tipo}`);
  }

  renderFactura(idFactura: number, plantillaId?: number): Observable<PlantillaRenderResponse> {
    const q = plantillaId != null ? `?plantillaId=${plantillaId}` : '';
    return this.http.get<PlantillaRenderResponse>(`${this.base}/render/FACTURA/${idFactura}${q}`);
  }

  renderPresupuesto(idPresupuesto: number, plantillaId?: number): Observable<PlantillaRenderResponse> {
    const q = plantillaId != null ? `?plantillaId=${plantillaId}` : '';
    return this.http.get<PlantillaRenderResponse>(`${this.base}/render/PRESUPUESTO/${idPresupuesto}${q}`);
  }

  renderRemito(idRemito: number, plantillaId?: number): Observable<PlantillaRenderResponse> {
    const q = plantillaId != null ? `?plantillaId=${plantillaId}` : '';
    return this.http.get<PlantillaRenderResponse>(`${this.base}/render/REMITO/${idRemito}${q}`);
  }

  printRendered(res: PlantillaRenderResponse): void {
    this.printDocument(res.html ?? '', res.css ?? '');
  }

  printDocument(html: string, css: string): void {
    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    document.body.appendChild(frame);

    const doc = frame.contentDocument ?? frame.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(frame);
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`);
    doc.close();

    const cleanup = () => {
      setTimeout(() => frame.parentNode?.removeChild(frame), 500);
    };

    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      cleanup();
    };
  }

  /** Imprime con plantilla; si falla el API, ejecuta fallback. */
  printWithFallback(
    render$: Observable<PlantillaRenderResponse>,
    fallback: () => void,
  ): void {
    render$.subscribe({
      next: res => this.printRendered(res),
      error: () => fallback(),
    });
  }
}
