import { Injectable, Injector, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, firstValueFrom, of, tap } from 'rxjs';
import { API_URL } from './api-base';
import { PermisoService } from './permiso.service';
import { esRolPanelAdmin } from '../config/config-rbac';

export interface UsuarioSesion {
    idUsuario: number;
    nombre: string;
    email: string;
    rol: string;
}

export interface RegistroData {
    nombre: string;
    email: string;
    contrasena: string;
}

export interface LoginData {
    email: string;
    contrasena: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

    /** Sesión solo en memoria — el JWT vive en cookie HttpOnly (no visible en F12 → Application). */
    usuarioActual = signal<UsuarioSesion | null>(null);

    private injector = inject(Injector);

    constructor(private http: HttpClient) { }

    private permisos(): PermisoService {
        return this.injector.get(PermisoService);
    }

    register(datos: RegistroData): Observable<UsuarioSesion> {
        return this.http.post<UsuarioSesion>(`${API_URL}/auth/register`, datos).pipe(
            tap(usuario => {
                this.usuarioActual.set(usuario);
                this.permisos().recargarMatriz();
            }),
        );
    }

    login(datos: LoginData): Observable<UsuarioSesion> {
        return this.http.post<UsuarioSesion>(`${API_URL}/auth/login`, datos).pipe(
            tap(usuario => {
                this.usuarioActual.set(usuario);
                this.permisos().recargarMatriz();
            }),
        );
    }

    /** Restaura sesión desde cookie HttpOnly vía GET /auth/me */
    restaurarSesion(): Promise<void> {
        localStorage.removeItem('novatech_usuario');
        return firstValueFrom(
            this.http.get<UsuarioSesion>(`${API_URL}/auth/me`).pipe(
                tap(u => {
                    this.usuarioActual.set(u);
                    this.permisos().recargarMatriz();
                }),
                catchError(() => {
                    this.usuarioActual.set(null);
                    return of(null);
                }),
            ),
        ).then(() => undefined);
    }

    logout(): void {
        this.http.post(`${API_URL}/auth/logout`, {}).subscribe({
            next: () => this.usuarioActual.set(null),
            error: () => this.usuarioActual.set(null),
        });
    }

    isLoggedIn(): boolean {
        return this.usuarioActual() !== null;
    }

    getRol(): string | null {
        return this.usuarioActual()?.rol ?? null;
    }

    esAdmin(): boolean {
        return esRolPanelAdmin(this.getRol());
    }

    esSuperAdmin(): boolean {
        const rol = this.getRol();
        return rol === 'SUPERADMIN' || rol === 'ADMIN';
    }

    getUsuario(): UsuarioSesion | null {
        return this.usuarioActual();
    }

    actualizarPerfil(datos: { nombre: string; email: string; contrasena?: string }): Observable<UsuarioSesion> {
        return this.http.put<UsuarioSesion>(`${API_URL}/auth/me`, datos).pipe(
            tap(u => this.usuarioActual.set(u)),
        );
    }
}
