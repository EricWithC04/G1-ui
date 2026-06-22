import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteHistorial, ClienteMetricas, PerfilCliente } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteCrmService {
  private base = `${environment.apiUrl}/perfiles`;

  constructor(private http: HttpClient) {}

  listar(q?: string, tipo?: string): Observable<PerfilCliente[]> {
    const params: Record<string, string> = {};
    if (q) params['q'] = q;
    if (tipo) params['tipo'] = tipo;
    return this.http.get<PerfilCliente[]>(this.base, { params });
  }

  obtener(id: number): Observable<PerfilCliente> {
    return this.http.get<PerfilCliente>(`${this.base}/${id}`);
  }

  crear(perfil: PerfilCliente): Observable<PerfilCliente> {
    return this.http.post<PerfilCliente>(this.base, perfil);
  }

  actualizar(id: number, perfil: Partial<PerfilCliente>): Observable<PerfilCliente> {
    return this.http.put<PerfilCliente>(`${this.base}/${id}`, perfil);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  metricas(id: number): Observable<ClienteMetricas> {
    return this.http.get<ClienteMetricas>(`${this.base}/${id}/metricas`);
  }

  historial(id: number): Observable<ClienteHistorial> {
    return this.http.get<ClienteHistorial>(`${this.base}/${id}/historial`);
  }
}
