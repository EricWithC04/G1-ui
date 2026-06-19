import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Categoria } from '../models/models';
import { BaseApiService } from './api-base';

// Servicio para hablar con el backend de categorias (/categorias).
// Hereda listar/obtener/crear/actualizar/eliminar de la clase base.
@Injectable({ providedIn: 'root' })
export class CategoriaService extends BaseApiService<Categoria> {
    constructor(http: HttpClient) {
        super(http, 'categorias');
    }
}
