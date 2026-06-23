import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Portal cliente: solo rol CLIENTE. Staff va a /admin. */
export const clienteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.parseUrl('/login');
  }
  if (!auth.esCliente()) {
    return router.parseUrl('/admin');
  }
  return true;
};
