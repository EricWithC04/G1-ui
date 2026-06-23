import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/models';
import { BaseApiService } from './api-base';

// @Injectable -> le dice a Angular que esta clase se puede "inyectar"
// (Angular la crea y la pasa sola a quien la necesite).
// providedIn: 'root' -> hay una sola instancia para toda la app.
@Injectable({ providedIn: 'root' })
export class ProductService extends BaseApiService<Product> {

    // Llamamos al constructor de la clase base diciendo que la ruta es "productos".
    constructor(http: HttpClient) {
        super(http, 'productos');
    }

    // Metodo extra solo de productos: el backend permite filtrar la lista
    //   /productos?nombre=teclado   -> busca por nombre
    //   /productos?categoriaId=2    -> filtra por categoria
    listarConFiltros(filtros?: {
        nombre?: string;
        categoriaId?: number;
        canal?: string;
        listaPrecio?: string;
        tipoCliente?: string;
    }): Observable<Product[]> {
        let params = new HttpParams();
        if (filtros?.nombre) {
            params = params.set('nombre', filtros.nombre);
        } else if (filtros?.categoriaId) {
            params = params.set('categoriaId', filtros.categoriaId);
        }
        if (filtros?.listaPrecio) {
            params = params.set('listaPrecio', filtros.listaPrecio);
        }
        if (filtros?.canal) {
            params = params.set('canal', filtros.canal);
        }
        if (filtros?.tipoCliente) {
            params = params.set('tipoCliente', filtros.tipoCliente);
        }
        return this.http.get<Product[]>(this.url, { params });
    }

    /** Precio de venta según canal (aplica precioCanal del backend). */
    precioVenta(p: Product): number {
        return p.precioCanal ?? p.precio ?? 0;
    }

    // --- Alias en ingles para no romper codigo viejo que ya los usaba ---
    getProducts(filtros?: { nombre?: string; categoriaId?: number }): Observable<Product[]> {
        return this.listarConFiltros(filtros);
    }
    getProduct(id: number): Observable<Product> { return this.obtener(id); }
    createProduct(product: Product): Observable<Product> { return this.crear(product); }
    updateProduct(id: number, product: Product): Observable<Product> { return this.actualizar(id, product); }
    deleteProduct(id: number): Observable<void> { return this.eliminar(id); }

    listarStockBajo(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.url}/stock-bajo`);
    }
}

