import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrmResumen } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `crm.service`: llama API `/ crm` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class CrmService {
  constructor(private http: HttpClient) {}

  resumen(): Observable<CrmResumen> {
    return this.http.get<CrmResumen>(`${environment.apiUrl}/crm/resumen`);
  }
}
