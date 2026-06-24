import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardKpi } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `dashboard.service`: llama API `/ dashboard` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  kpis(): Observable<DashboardKpi> {
    return this.http.get<DashboardKpi>(`${environment.apiUrl}/dashboard/kpis`);
  }
}
