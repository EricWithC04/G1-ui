import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './api-base';
import { OrdenCompra } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `orden-compra.service`: llama API `/ orden-compra` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class OrdenCompraService extends BaseApiService<OrdenCompra> {
  constructor(http: HttpClient) {
    super(http, 'ordenes-compra');
  }

  generarStockBajo(): Observable<OrdenCompra[]> {
    return this.http.post<OrdenCompra[]>(`${environment.apiUrl}/ordenes-compra/generar-stock-bajo`, {});
  }

  generar(productoIds: number[]): Observable<OrdenCompra[]> {
    return this.http.post<OrdenCompra[]>(`${environment.apiUrl}/ordenes-compra/generar`, { productoIds });
  }

  enviar(id: number): Observable<OrdenCompra> {
    return this.http.post<OrdenCompra>(`${environment.apiUrl}/ordenes-compra/${id}/enviar`, {});
  }

  recibir(id: number): Observable<OrdenCompra> {
    return this.http.post<OrdenCompra>(`${environment.apiUrl}/ordenes-compra/${id}/recibir`, {});
  }
}
