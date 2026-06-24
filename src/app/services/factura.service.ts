import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './api-base';
import { Factura, GenerarFacturaRequest } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `factura.service`: llama API `/ factura` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class FacturaService extends BaseApiService<Factura> {
  constructor(http: HttpClient) {
    super(http, 'facturas');
  }

  generarDesdePedido(pedidoId: number, opciones?: {
    formaCobro?: string;
    cantidadCuotas?: number;
    interes?: number;
    puntoVenta?: number;
    tipoComprobante?: string;
    remitoId?: number;
  }): Observable<Factura> {
    const body: GenerarFacturaRequest = {
      pedidoId,
      formaCobro: opciones?.formaCobro ?? 'CONTADO',
      cantidadCuotas: opciones?.cantidadCuotas,
      interes: opciones?.interes,
      puntoVenta: opciones?.puntoVenta,
      tipoComprobante: opciones?.tipoComprobante,
      remitoId: opciones?.remitoId,
    };
    return this.http.post<Factura>(`${environment.apiUrl}/facturas/generar`, body);
  }

  generarDesdePresupuesto(presupuestoId: number, opciones?: {
    formaCobro?: string;
    puntoVenta?: number;
    tipoComprobante?: string;
    remitoId?: number;
    notas?: string;
  }): Observable<Factura> {
    const body: GenerarFacturaRequest = {
      presupuestoId,
      formaCobro: opciones?.formaCobro ?? 'CONTADO',
      puntoVenta: opciones?.puntoVenta,
      tipoComprobante: opciones?.tipoComprobante,
      remitoId: opciones?.remitoId,
      notas: opciones?.notas,
    };
    return this.http.post<Factura>(`${environment.apiUrl}/facturas/generar`, body);
  }

  generar(body: GenerarFacturaRequest): Observable<Factura> {
    return this.http.post<Factura>(`${environment.apiUrl}/facturas/generar`, body);
  }

  emitir(id: number): Observable<Factura> {
    return this.http.post<Factura>(`${environment.apiUrl}/facturas/${id}/emitir`, {});
  }
}
