import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ConfigModuloService, RbacMatriz } from './config-modulo.service';
import { esRolConAccesoTotal, tienePermiso } from '../config/config-rbac';

@Injectable({ providedIn: 'root' })
export class PermisoService {
  private matriz = signal<RbacMatriz | null>(null);
  private auth = inject(AuthService);
  private configModulo = inject(ConfigModuloService);

  recargarMatriz(): void {
    this.configModulo.matrizRbac().subscribe({
      next: m => this.matriz.set(m),
      error: () => this.matriz.set(null),
    });
  }

  limpiarMatriz(): void {
    this.matriz.set(null);
  }

  esSuperAdmin(): boolean {
    return esRolConAccesoTotal(this.auth.getRol());
  }

  puede(permiso: string): boolean {
    const rol = this.auth.getRol();
    if (!rol) return false;
    if (esRolConAccesoTotal(rol)) return true;

    const m = this.matriz();
    if (m?.asignaciones) {
      const asignados = m.asignaciones[rol] ?? m.asignaciones[rol.toUpperCase()];
      if (asignados?.includes('*')) return true;
      if (asignados?.includes(permiso)) return true;
    }
    return tienePermiso(rol, permiso);
  }

  puedeAlguno(...permisos: string[]): boolean {
    return permisos.some(p => this.puede(p));
  }

  puedeGestionarRoles(): boolean {
    return this.esSuperAdmin() || this.puede('usuarios.assign_roles');
  }
}
