import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './api-base';
import { Presupuesto, PresupuestoRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PresupuestoService extends BaseApiService<Presupuesto> {
  constructor(http: HttpClient) {
    super(http, 'presupuestos');
  }

  crearDesdeRequest(request: PresupuestoRequest): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(this.url, request);
  }

  actualizarRequest(id: number, request: PresupuestoRequest): Observable<Presupuesto> {
    return this.http.put<Presupuesto>(`${this.url}/${id}`, request);
  }

  cambiarEstado(id: number, estado: string): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(`${this.url}/${id}/estado/${estado}`, {});
  }
}
