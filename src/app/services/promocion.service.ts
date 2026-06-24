import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './api-base';
import { Promocion } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `promocion.service`: llama API `/ promocion` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class PromocionService extends BaseApiService<Promocion> {
  constructor(http: HttpClient) {
    super(http, 'promociones');
  }

  activar(id: number): Observable<Promocion> {
    return this.http.post<Promocion>(`${environment.apiUrl}/promociones/${id}/activar`, {});
  }
}
