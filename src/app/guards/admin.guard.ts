import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ============================================================
//  Guard de administrador.
//  Protege todo lo que cuelga de /admin. Reglas:
//    - Si NO esta logueado -> lo mandamos a /login.
//    - Si esta logueado pero NO es ADMIN (es un CLIENTE) -> lo mandamos a la tienda (/).
//    - Si es ADMIN -> lo dejamos pasar.
// ============================================================
export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Sin sesion: al login.
    if (!auth.isLoggedIn()) {
        return router.parseUrl('/login');
    }

    // Logueado pero sin permisos de admin: lo devolvemos a la tienda.
    if (!auth.esAdmin()) {
        return router.parseUrl('/');
    }

    // Es admin: puede entrar al panel.
    return true;
};
