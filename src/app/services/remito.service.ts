import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './api-base';
import { Remito, RemitoRequest } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `remito.service`: llama API `/ remito` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class RemitoService extends BaseApiService<Remito> {
  constructor(http: HttpClient) {
    super(http, 'remitos');
  }

  crearDesdeRequest(request: RemitoRequest): Observable<Remito> {
    return this.http.post<Remito>(this.url, request);
  }

  generarDesdePedido(pedidoId: number, direccionEntrega?: string): Observable<Remito> {
    const params = direccionEntrega ? `?direccionEntrega=${encodeURIComponent(direccionEntrega)}` : '';
    return this.http.post<Remito>(`${this.url}/generar-pedido/${pedidoId}${params}`, {});
  }

  generarDesdePresupuesto(presupuestoId: number, direccionEntrega?: string): Observable<Remito> {
    const params = direccionEntrega ? `?direccionEntrega=${encodeURIComponent(direccionEntrega)}` : '';
    return this.http.post<Remito>(`${this.url}/generar-presupuesto/${presupuestoId}${params}`, {});
  }

  cambiarEstado(id: number, estado: string): Observable<Remito> {
    return this.http.post<Remito>(`${this.url}/${id}/estado/${estado}`, {});
  }
}
