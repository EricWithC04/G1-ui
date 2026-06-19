import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/models';
import { BaseApiService } from './api-base';

// Servicio para hablar con el backend de usuarios (/usuarios).
@Injectable({ providedIn: 'root' })
export class UsuarioService extends BaseApiService<Usuario> {
    constructor(http: HttpClient) {
        super(http, 'usuarios');
    }
}
