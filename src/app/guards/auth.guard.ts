import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ============================================================
//  Guard de autenticacion.
//  Un "guard" es una funcion que Angular ejecuta ANTES de entrar a una ruta.
//  Si devuelve true, deja pasar. Si devuelve false (o una redireccion), no.
//
//  Este guard protege las paginas que necesitan estar logueado
//  (carrito, checkout, mis-pedidos, perfil). Si no hay sesion, manda a /login.
// ============================================================
export const authGuard: CanActivateFn = () => {
    // inject() nos deja pedir servicios dentro de una funcion (no hace falta constructor).
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn()) {
        return true; // hay sesion: puede entrar
    }

    // No hay sesion: lo mandamos al login.
    return router.parseUrl('/login');
};
