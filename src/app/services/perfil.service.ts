import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PerfilCliente } from '../models/models';
import { BaseApiService } from './api-base';

// Servicio para hablar con el backend de perfiles de cliente (/perfiles).
@Injectable({ providedIn: 'root' })
export class PerfilService extends BaseApiService<PerfilCliente> {
    constructor(http: HttpClient) {
        super(http, 'perfiles');
    }
}
