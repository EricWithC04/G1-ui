import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListaPrecio, ListaPrecioDetalle, ListaPrecioUpdate, PrecioResuelto } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Servicio Angular `lista-precio.service`: llama API `/ lista-precio` y expone Observables al UI.
 */
@Injectable({ providedIn: 'root' })
export class ListaPrecioService {
  private url = `${environment.apiUrl}/listas-precios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<ListaPrecio[]> {
    return this.http.get<ListaPrecio[]>(this.url);
  }

  obtener(id: number): Observable<ListaPrecio> {
    return this.http.get<ListaPrecio>(`${this.url}/${id}`);
  }

  actualizar(id: number, body: ListaPrecioUpdate): Observable<ListaPrecio> {
    return this.http.put<ListaPrecio>(`${this.url}/${id}`, body);
  }

  listarDetalles(id: number): Observable<ListaPrecioDetalle[]> {
    return this.http.get<ListaPrecioDetalle[]>(`${this.url}/${id}/detalles`);
  }

  guardarDetalle(id: number, body: {
    idProducto: number;
    descuentoPorcentaje?: number;
    precioFijo?: number;
  }): Observable<ListaPrecioDetalle> {
    return this.http.post<ListaPrecioDetalle>(`${this.url}/${id}/detalles`, body);
  }

  eliminarDetalle(idLista: number, idDetalle: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${idLista}/detalles/${idDetalle}`);
  }

  resolver(productoId: number, opts?: { lista?: string; canal?: string; tipoCliente?: string }): Observable<PrecioResuelto> {
    let params = `productoId=${productoId}`;
    if (opts?.lista) params += `&lista=${encodeURIComponent(opts.lista)}`;
    if (opts?.canal) params += `&canal=${encodeURIComponent(opts.canal)}`;
    if (opts?.tipoCliente) params += `&tipoCliente=${encodeURIComponent(opts.tipoCliente)}`;
    return this.http.get<PrecioResuelto>(`${this.url}/resolver?${params}`);
  }
}
