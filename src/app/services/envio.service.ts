import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Envio, EnvioDetalleResponse } from '../models/models';
import { BaseApiService } from './api-base';
import { Observable } from 'rxjs';

/**
 * Servicio Angular `envio.service`: llama API `/ envio` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class EnvioService extends BaseApiService<Envio> {
    constructor(http: HttpClient) {
        super(http, 'envios');
    }

    obtenerDetalle(id: number): Observable<EnvioDetalleResponse> {
        return this.http.get<EnvioDetalleResponse>(`${this.url}/${id}/detalle`);
    }
}
