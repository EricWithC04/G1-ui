import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfirmarOrdenRequest, ConfirmarOrdenResponse } from '../models/models';
import { API_URL } from './api-base';

/**
 * Servicio Angular `orden-venta.service`: llama API `/ orden-venta` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class OrdenVentaService {
    constructor(private http: HttpClient) {}

    confirmar(request: ConfirmarOrdenRequest): Observable<ConfirmarOrdenResponse> {
        return this.http.post<ConfirmarOrdenResponse>(`${API_URL}/ordenes/confirmar`, request);
    }
}
