import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './api-base';
import { Campana, MensajeCliente } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `campana.service`: llama API `/ campana` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class CampanaService extends BaseApiService<Campana> {
  constructor(http: HttpClient) {
    super(http, 'campanas');
  }

  enviar(id: number): Observable<Campana> {
    return this.http.post<Campana>(`${environment.apiUrl}/campanas/${id}/enviar`, {});
  }

  listarMensajes(idCampana: number): Observable<MensajeCliente[]> {
    return this.http.get<MensajeCliente[]>(`${environment.apiUrl}/campanas/${idCampana}/mensajes`);
  }
}
