import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api-base';
import {
  Conversacion,
  Factura,
  MensajeConversacion,
  Pedido,
  PedidoDetalleResponse,
  PerfilCliente,
  SolicitudDevolucion,
} from '../models/models';

export interface ActualizarPerfilClienteRequest {
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  nombre?: string;
  email?: string;
}

export interface CrearTicketClienteRequest {
  asunto: string;
  cuerpo: string;
  etiquetas?: string;
  idPedido?: number;
}

export interface CrearDevolucionRequest {
  idPedido: number;
  motivo: string;
  descripcion?: string;
  lineasJson?: string;
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

  listarTickets(): Observable<Conversacion[]> {
    return this.http.get<Conversacion[]>(`${this.base}/tickets`);
  }

  crearTicket(datos: CrearTicketClienteRequest): Observable<Conversacion> {
    return this.http.post<Conversacion>(`${this.base}/tickets`, datos);
  }

  listarMensajesTicket(id: number): Observable<MensajeConversacion[]> {
    return this.http.get<MensajeConversacion[]>(`${this.base}/tickets/${id}/mensajes`);
  }

  responderTicket(id: number, cuerpo: string): Observable<MensajeConversacion> {
    return this.http.post<MensajeConversacion>(`${this.base}/tickets/${id}/mensajes`, { cuerpo });
  }

  listarDevoluciones(): Observable<SolicitudDevolucion[]> {
    return this.http.get<SolicitudDevolucion[]>(`${this.base}/devoluciones`);
  }

  crearDevolucion(datos: CrearDevolucionRequest): Observable<SolicitudDevolucion> {
    return this.http.post<SolicitudDevolucion>(`${this.base}/devoluciones`, datos);
  }

  obtenerDevolucion(id: number): Observable<SolicitudDevolucion> {
    return this.http.get<SolicitudDevolucion>(`${this.base}/devoluciones/${id}`);
  }
}
