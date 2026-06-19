import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlanCuotas } from '../models/models';
import { BaseApiService } from './api-base';

// Servicio para hablar con el backend de planes de cuotas (/planes).
@Injectable({ providedIn: 'root' })
export class PlanCuotasService extends BaseApiService<PlanCuotas> {
    constructor(http: HttpClient) {
        super(http, 'planes');
    }
}
