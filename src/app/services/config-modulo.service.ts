import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CatalogoMaestro,
  Emisor,
  IntegracionCanal,
  LogSistema,
  PermisoRbac,
  PlantillaImpresion,
  RegistroAuditoria,
  RolRbac,
  Usuario,
} from '../models/models';
import { environment } from '../../environments/environment';

export interface ContabilidadResumen {
  alicuotas: { idAlicuota?: number; codigo?: string; nombre?: string; porcentaje?: number; activo?: boolean }[];
  config: { clave?: string; valor?: string; descripcion?: string }[];
  contadores: Record<string, number>;
}

export interface RbacMatriz {
  roles: RolRbac[];
  permisos: PermisoRbac[];
  asignaciones: Record<string, string[]>;
}

export interface CatalogosResponse {
  categorias: CatalogoMaestro[];
  depositos: CatalogoMaestro[];
  condicionesPago: CatalogoMaestro[];
}

@Injectable({ providedIn: 'root' })
export class ConfigModuloService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // RBAC
  matrizRbac(): Observable<RbacMatriz> {
    return this.http.get<RbacMatriz>(`${this.base}/configuracion/rbac/matriz`);
  }

  actualizarRol(rol: string, permisos: string[]): Observable<void> {
    return this.http.patch<void>(`${this.base}/configuracion/rbac/roles/${rol}`, { permisos });
  }

  crearRol(body: { clave: string; nombre: string; descripcion?: string }): Observable<RolRbac> {
    return this.http.post<RolRbac>(`${this.base}/configuracion/rbac/roles`, body);
  }

  eliminarRol(clave: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/configuracion/rbac/roles/${clave}`);
  }

  actualizarRolMeta(clave: string, body: { nombre?: string; descripcion?: string }): Observable<RolRbac> {
    return this.http.put<RolRbac>(`${this.base}/configuracion/rbac/roles/${clave}`, body);
  }

  listarRoles(): Observable<RolRbac[]> {
    return this.http.get<RolRbac[]>(`${this.base}/configuracion/rbac/roles`);
  }

  // Contabilidad
  contabilidadResumen(): Observable<ContabilidadResumen> {
    return this.http.get<ContabilidadResumen>(`${this.base}/config/contabilidad/resumen`);
  }

  restaurarContabilidad(): Observable<ContabilidadResumen> {
    return this.http.post<ContabilidadResumen>(`${this.base}/config/contabilidad/resumen`, {});
  }

  // Emisores
  listarEmisores(): Observable<Emisor[]> {
    return this.http.get<Emisor[]>(`${this.base}/config/emisores`);
  }

  crearEmisor(emisor: Emisor): Observable<Emisor> {
    return this.http.post<Emisor>(`${this.base}/config/emisores`, emisor);
  }

  actualizarEmisor(id: number, emisor: Emisor): Observable<Emisor> {
    return this.http.put<Emisor>(`${this.base}/config/emisores/${id}`, emisor);
  }

  eliminarEmisor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/config/emisores/${id}`);
  }

  // Plantillas
  listarPlantillas(): Observable<PlantillaImpresion[]> {
    return this.http.get<PlantillaImpresion[]>(`${this.base}/config/plantillas`);
  }

  crearPlantilla(p: PlantillaImpresion): Observable<PlantillaImpresion> {
    return this.http.post<PlantillaImpresion>(`${this.base}/config/plantillas`, p);
  }

  actualizarPlantilla(id: number, p: PlantillaImpresion): Observable<PlantillaImpresion> {
    return this.http.put<PlantillaImpresion>(`${this.base}/config/plantillas/${id}`, p);
  }

  duplicarPlantilla(id: number): Observable<PlantillaImpresion> {
    return this.http.post<PlantillaImpresion>(`${this.base}/config/plantillas/${id}/duplicar`, {});
  }

  // Catálogos
  listarCatalogos(): Observable<CatalogosResponse> {
    return this.http.get<CatalogosResponse>(`${this.base}/config/catalogos`);
  }

  crearCatalogo(tipo: string, item: CatalogoMaestro): Observable<CatalogoMaestro> {
    return this.http.post<CatalogoMaestro>(`${this.base}/config/catalogos/${tipo}`, item);
  }

  actualizarCatalogo(id: number, item: Partial<CatalogoMaestro>): Observable<CatalogoMaestro> {
    return this.http.patch<CatalogoMaestro>(`${this.base}/config/catalogos/${id}`, item);
  }

  // Auditoría / logs
  auditoria(filtros?: { q?: string; entidad?: string; usuario?: string }): Observable<RegistroAuditoria[]> {
    let params = new HttpParams();
    if (filtros?.q) params = params.set('q', filtros.q);
    if (filtros?.entidad) params = params.set('entidad', filtros.entidad);
    if (filtros?.usuario) params = params.set('usuario', filtros.usuario);
    return this.http.get<RegistroAuditoria[]>(`${this.base}/configuracion/auditoria/registros`, { params });
  }

  logs(filtros?: { nivel?: string; origen?: string; q?: string; dias?: number }): Observable<LogSistema[]> {
    let params = new HttpParams();
    if (filtros?.nivel) params = params.set('nivel', filtros.nivel);
    if (filtros?.origen) params = params.set('origen', filtros.origen);
    if (filtros?.q) params = params.set('q', filtros.q);
    if (filtros?.dias) params = params.set('dias', filtros.dias);
    return this.http.get<LogSistema[]>(`${this.base}/configuracion/logs/registros`, { params });
  }
}
