import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `admin.service`: llama API `/ admin` y expone Observables al UI.
 */
export interface AdminBuscarItem {
  tipo: string;
  id?: number;
  titulo: string;
  subtitulo?: string;
  link: string;
}

export interface AdminBuscarResponse {
  clientes: AdminBuscarItem[];
  facturas: AdminBuscarItem[];
  remitos: AdminBuscarItem[];
  presupuestos: AdminBuscarItem[];
}

export interface AdminNotificacion {
  tipo: string;
  titulo: string;
  mensaje: string;
  link: string;
  fecha?: string;
  leida?: boolean;
}

export interface ConversacionResumen {
  pendientes: number;
  sinResolver: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  buscar(q: string): Observable<AdminBuscarResponse> {
    return this.http.get<AdminBuscarResponse>(`${this.base}/buscar`, { params: { q } });
  }

  notificaciones(): Observable<AdminNotificacion[]> {
    return this.http.get<AdminNotificacion[]>(`${this.base}/notificaciones`);
  }
}
