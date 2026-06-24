import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfiguracionSistema, RegistroAuditoria, LogSistema } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `configuracion.service`: llama API `/ configuracion` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  constructor(private http: HttpClient) {}

  listarGrupo(grupo: string): Observable<ConfiguracionSistema[]> {
    return this.http.get<ConfiguracionSistema[]>(`${environment.apiUrl}/configuracion/${grupo}`);
  }

  mapaGrupo(grupo: string): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${environment.apiUrl}/configuracion/${grupo}/mapa`);
  }

  guardarGrupo(grupo: string, valores: Record<string, string>): Observable<ConfiguracionSistema[]> {
    return this.http.put<ConfiguracionSistema[]>(`${environment.apiUrl}/configuracion/${grupo}`, valores);
  }

  registrosAuditoria(): Observable<RegistroAuditoria[]> {
    return this.http.get<RegistroAuditoria[]>(`${environment.apiUrl}/configuracion/auditoria/registros`);
  }

  registrosLogs(): Observable<LogSistema[]> {
    return this.http.get<LogSistema[]>(`${environment.apiUrl}/configuracion/logs/registros`);
  }
}
