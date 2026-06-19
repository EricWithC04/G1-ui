import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from './api-base';

// ============================================================
//  Forma de los datos que usamos para la autenticacion.
// ============================================================

// Lo que devuelve el backend al hacer login o registrarse.
// Es el usuario SIN la contrasena (el backend nunca la manda).
export interface UsuarioSesion {
    idUsuario: number;
    nombre: string;
    email: string;
    rol: string; // "ADMIN" o "CLIENTE"
}

// Lo que mandamos al registrarnos (POST /auth/register).
export interface RegistroData {
    nombre: string;
    email: string;
    contrasena: string;
}

// Lo que mandamos al iniciar sesion (POST /auth/login).
export interface LoginData {
    email: string;
    contrasena: string;
}

// Clave con la que guardamos al usuario logueado en el localStorage del navegador.
// localStorage es una "cajita" del navegador que recuerda datos aunque cerremos la pestania.
const CLAVE_STORAGE = 'novatech_usuario';

// ============================================================
//  AuthService: maneja TODO lo de login/registro/sesion.
//  providedIn: 'root' => hay una sola instancia para toda la app.
// ============================================================
@Injectable({ providedIn: 'root' })
export class AuthService {

    // signal con el usuario actual (o null si nadie inicio sesion).
    // Es reactivo: cuando cambia, las pantallas que lo usan se actualizan solas.
    // Lo inicializamos leyendo lo que haya guardado en localStorage.
    usuarioActual = signal<UsuarioSesion | null>(this.leerDeStorage());

    constructor(private http: HttpClient) { }

    // Registra un cliente nuevo en el backend.
    // No inicia sesion solo: el componente decide si despues llama a login.
    register(datos: RegistroData): Observable<UsuarioSesion> {
        return this.http.post<UsuarioSesion>(`${API_URL}/auth/register`, datos);
    }

    // Inicia sesion contra el backend. Si sale bien, guarda el usuario.
    // tap() es un "espia": deja pasar la respuesta pero aprovecha para guardarla.
    login(datos: LoginData): Observable<UsuarioSesion> {
        return this.http.post<UsuarioSesion>(`${API_URL}/auth/login`, datos).pipe(
            tap(usuario => this.guardarSesion(usuario))
        );
    }

    // Guarda el usuario en memoria (signal) y en localStorage.
    guardarSesion(usuario: UsuarioSesion): void {
        this.usuarioActual.set(usuario);
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(usuario));
    }

    // Cierra la sesion: borra el usuario de la memoria y del localStorage.
    logout(): void {
        this.usuarioActual.set(null);
        localStorage.removeItem(CLAVE_STORAGE);
    }

    // true si hay alguien logueado.
    isLoggedIn(): boolean {
        return this.usuarioActual() !== null;
    }

    // Devuelve el rol del usuario logueado ("ADMIN" / "CLIENTE") o null si no hay nadie.
    getRol(): string | null {
        return this.usuarioActual()?.rol ?? null;
    }

    // true si el usuario logueado es administrador.
    esAdmin(): boolean {
        return this.getRol() === 'ADMIN';
    }

    // Devuelve el usuario logueado completo (o null).
    getUsuario(): UsuarioSesion | null {
        return this.usuarioActual();
    }

    // Lee el usuario guardado en localStorage al arrancar la app.
    // Si no hay nada o esta roto, devuelve null.
    private leerDeStorage(): UsuarioSesion | null {
        const texto = localStorage.getItem(CLAVE_STORAGE);
        if (!texto) {
            return null;
        }
        try {
            return JSON.parse(texto) as UsuarioSesion;
        } catch {
            return null;
        }
    }
}
