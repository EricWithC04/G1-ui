import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Envio } from '../models/models';
import { BaseApiService } from './api-base';

// Servicio para hablar con el backend de envios (/envios).
@Injectable({ providedIn: 'root' })
export class EnvioService extends BaseApiService<Envio> {
    constructor(http: HttpClient) {
        super(http, 'envios');
    }
}
