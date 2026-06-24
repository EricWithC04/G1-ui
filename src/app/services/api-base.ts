import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Direccion base del backend de Spring Boot.
// La sacamos del "environment". Ahora esta VACIA a proposito, asi las URLs
// quedan RELATIVAS (ej: '/productos') y salen al mismo origen que sirve la
// app; el dev server de Angular las redirige al backend via proxy.conf.json.
/**
 * Clase base HTTP CRUD: listar, obtener, crear, actualizar y eliminar por recurso REST.
 */
export const API_URL = environment.apiUrl;

// ============================================================
//  Clase base para hablar con el backend (operaciones CRUD).
//  CRUD = Crear, Leer, Actualizar y Borrar.
//  Es "generica": el <T> es el tipo de dato con el que trabaja
//  (Producto, Usuario, Pedido, etc.). Asi no repetimos el mismo
//  codigo en cada servicio: cada servicio solo dice su "ruta".
// ============================================================
export class BaseApiService<T> {

    // http: la herramienta de Angular para hacer pedidos HTTP.
    // resource: el nombre de la ruta en el backend (ej: "productos").
    constructor(protected http: HttpClient, protected resource: string) { }

    // Arma la URL (relativa), por ejemplo: /productos
    protected get url(): string {
        return `${API_URL}/${this.resource}`;
    }

    // GET /recurso -> trae la lista completa.
    listar(): Observable<T[]> {
        return this.http.get<T[]>(this.url);
    }

    // GET /recurso/{id} -> trae un solo elemento por su id.
    obtener(id: number): Observable<T> {
        return this.http.get<T>(`${this.url}/${id}`);
    }

    // POST /recurso -> crea un elemento nuevo (le mandamos el objeto en el cuerpo).
    crear(dato: T): Observable<T> {
        return this.http.post<T>(this.url, dato);
    }

    // PUT /recurso/{id} -> actualiza un elemento que ya existe.
    actualizar(id: number, dato: T): Observable<T> {
        return this.http.put<T>(`${this.url}/${id}`, dato);
    }

    // DELETE /recurso/{id} -> borra un elemento por su id.
    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/${id}`);
    }
}