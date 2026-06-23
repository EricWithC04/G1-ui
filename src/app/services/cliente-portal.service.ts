import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api-base';
import { Factura, Pedido, PedidoDetalleResponse, PerfilCliente } from '../models/models';

export interface ActualizarPerfilClienteRequest {
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  nombre?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class ClientePortalService {
  private base = `${API_URL}/cliente`;

  constructor(private http: HttpClient) {}

  listarPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.base}/pedidos`);
  }

  obtenerPedido(id: number): Observable<PedidoDetalleResponse> {
    return this.http.get<PedidoDetalleResponse>(`${this.base}/pedidos/${id}`);
  }

  listarFacturas(): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.base}/facturas`);
  }

  obtenerFactura(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.base}/facturas/${id}`);
  }

  obtenerPerfil(): Observable<PerfilCliente> {
    return this.http.get<PerfilCliente>(`${this.base}/perfil`);
  }

  actualizarPerfil(datos: ActualizarPerfilClienteRequest): Observable<PerfilCliente> {
    return this.http.put<PerfilCliente>(`${this.base}/perfil`, datos);
  }
}
