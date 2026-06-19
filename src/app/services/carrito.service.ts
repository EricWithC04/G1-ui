import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Carrito, DetalleCarrito } from '../models/models';
import { BaseApiService } from './api-base';

// Servicio para hablar con el backend de carritos (/carritos).
@Injectable({ providedIn: 'root' })
export class CarritoService extends BaseApiService<Carrito> {
    constructor(http: HttpClient) {
        super(http, 'carritos');
    }
}

// Servicio para los renglones del carrito (/detalle-carritos).
@Injectable({ providedIn: 'root' })
export class DetalleCarritoService extends BaseApiService<DetalleCarrito> {
    constructor(http: HttpClient) {
        super(http, 'detalle-carritos');
    }
}
