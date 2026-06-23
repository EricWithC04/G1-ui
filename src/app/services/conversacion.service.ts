import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversacion, MensajeConversacion, IntegracionCanal } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConversacionService {
  private base = `${environment.apiUrl}/crm/conversaciones`;

  constructor(private http: HttpClient) {}

  listar(canal?: string, estado?: string, busqueda?: string): Observable<Conversacion[]> {
    const params: Record<string, string> = {};
    if (canal) params['canal'] = canal;
    if (estado) params['estado'] = estado;
    if (busqueda) params['busqueda'] = busqueda;
    return this.http.get<Conversacion[]>(this.base, { params });
  }

  obtener(id: number): Observable<Conversacion> {
    return this.http.get<Conversacion>(`${this.base}/${id}`);
  }

  mensajes(id: number): Observable<MensajeConversacion[]> {
    return this.http.get<MensajeConversacion[]>(`${this.base}/${id}/mensajes`);
  }

  enviar(id: number, cuerpo: string, remitente?: string): Observable<MensajeConversacion> {
    return this.http.post<MensajeConversacion>(`${this.base}/${id}/mensajes`, { cuerpo, remitenteNombre: remitente });
  }

  actualizar(id: number, datos: Partial<Conversacion>): Observable<Conversacion> {
    return this.http.put<Conversacion>(`${this.base}/${id}`, datos);
  }

  resumen(): Observable<{ pendientes: number; sinResolver: number }> {
    return this.http.get<{ pendientes: number; sinResolver: number }>(`${this.base}/resumen`);
  }

  listarPendientes(): Observable<Conversacion[]> {
    return this.listar(undefined, 'PENDIENTE');
  }
}

@Injectable({ providedIn: 'root' })
export class IntegracionService {
  constructor(private http: HttpClient) {}

  listar(): Observable<IntegracionCanal[]> {
    return this.http.get<IntegracionCanal[]>(`${environment.apiUrl}/crm/integraciones`);
  }

  actualizar(id: number, datos: Partial<IntegracionCanal>): Observable<IntegracionCanal> {
    return this.http.put<IntegracionCanal>(`${environment.apiUrl}/crm/integraciones/${id}`, datos);
  }
}
