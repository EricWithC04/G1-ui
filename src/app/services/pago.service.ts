import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pago } from '../models/models';
import { BaseApiService } from './api-base';

// Servicio para hablar con el backend de pagos (/pagos).
@Injectable({ providedIn: 'root' })
export class PagoService extends BaseApiService<Pago> {
    constructor(http: HttpClient) {
        super(http, 'pagos');
    }
}
