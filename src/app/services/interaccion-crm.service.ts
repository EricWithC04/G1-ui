import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './api-base';
import { InteraccionCrm } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InteraccionCrmService extends BaseApiService<InteraccionCrm> {
  constructor(http: HttpClient) {
    super(http, 'interacciones');
  }

  listarPorCliente(clienteId: number): Observable<InteraccionCrm[]> {
    return this.http.get<InteraccionCrm[]>(`${environment.apiUrl}/interacciones?clienteId=${clienteId}`);
  }
}
