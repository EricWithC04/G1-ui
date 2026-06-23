import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermisoService } from '../services/permiso.service';
import { AuthService } from '../services/auth.service';

export function permisoGuard(permiso: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const permisos = inject(PermisoService);
    const router = inject(Router);
    if (!auth.isLoggedIn() || !auth.esAdmin()) {
      return router.createUrlTree(['/login']);
    }
    if (!permisos.puede(permiso)) {
      return router.createUrlTree(['/admin/configuracion']);
    }
    return true;
  };
}
