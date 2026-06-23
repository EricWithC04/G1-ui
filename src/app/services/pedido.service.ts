import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pedido, DetallePedido, PedidoDetalleResponse } from '../models/models';
import { BaseApiService } from './api-base';
import { Observable } from 'rxjs';

// Servicio para hablar con el backend de pedidos (/pedidos).
@Injectable({ providedIn: 'root' })
export class PedidoService extends BaseApiService<Pedido> {
    constructor(http: HttpClient) {
        super(http, 'pedidos');
    }

    override listar(canalOrigen?: string, estado?: string): Observable<Pedido[]> {
        let params = new HttpParams();
        if (canalOrigen) params = params.set('canalOrigen', canalOrigen);
        if (estado) params = params.set('estado', estado);
        return this.http.get<Pedido[]>(this.url, { params });
    }

    obtenerDetalle(id: number): Observable<PedidoDetalleResponse> {
        return this.http.get<PedidoDetalleResponse>(`${this.url}/${id}/detalle`);
    }
}

// Servicio para los renglones del pedido (/detalle-pedidos).
@Injectable({ providedIn: 'root' })
export class DetallePedidoService extends BaseApiService<DetallePedido> {
    constructor(http: HttpClient) {
        super(http, 'detalle-pedidos');
    }
}
