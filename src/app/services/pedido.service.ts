import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pedido, DetallePedido } from '../models/models';
import { BaseApiService } from './api-base';

// Servicio para hablar con el backend de pedidos (/pedidos).
@Injectable({ providedIn: 'root' })
export class PedidoService extends BaseApiService<Pedido> {
    constructor(http: HttpClient) {
        super(http, 'pedidos');
    }
}

// Servicio para los renglones del pedido (/detalle-pedidos).
@Injectable({ providedIn: 'root' })
export class DetallePedidoService extends BaseApiService<DetallePedido> {
    constructor(http: HttpClient) {
        super(http, 'detalle-pedidos');
    }
}
