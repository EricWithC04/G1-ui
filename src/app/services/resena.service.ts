import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Resena } from '../models/models';
import { BaseApiService } from './api-base';

// Servicio para hablar con el backend de resenas (/resenas).
@Injectable({ providedIn: 'root' })
export class ResenaService extends BaseApiService<Resena> {
    constructor(http: HttpClient) {
        super(http, 'resenas');
    }

    // Metodo extra: el backend permite traer solo las resenas de un producto
    //   /resenas?productoId=2
    listarPorProducto(productoId: number): Observable<Resena[]> {
        const params = new HttpParams().set('productoId', productoId);
        return this.http.get<Resena[]>(this.url, { params });
    }
}
