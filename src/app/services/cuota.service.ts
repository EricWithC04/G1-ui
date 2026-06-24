import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cuota } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `cuota.service`: llama API `/ cuota` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class CuotaService {
  private base = `${environment.apiUrl}/cuotas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Cuota[]> {
    return this.http.get<Cuota[]>(this.base);
  }

  vencidas(): Observable<Cuota[]> {
    return this.http.get<Cuota[]>(`${this.base}/vencidas`);
  }

  porVencer(dias = 7): Observable<Cuota[]> {
    return this.http.get<Cuota[]>(`${this.base}/por-vencer?dias=${dias}`);
  }

  pagar(id: number): Observable<Cuota> {
    return this.http.post<Cuota>(`${this.base}/${id}/pagar`, {});
  }
}
