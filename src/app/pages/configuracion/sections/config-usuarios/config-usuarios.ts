import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { AdminSearch } from '../../../../components/admin-search/admin-search';
import { ConfigModuloService } from '../../../../services/config-modulo.service';
import { PermisoService } from '../../../../services/permiso.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { PermisoRbac, RolRbac, Usuario } from '../../../../models/models';
import { coincideBusqueda } from '../../../../utils/busqueda-admin';

@Component({
  selector: 'app-config-usuarios',
  imports: [ConfigPageShell, FormsModule, AdminSearch, DatePipe],
  templateUrl: './config-usuarios.html',
})
export class ConfigUsuarios implements OnInit {
  tab = signal<'usuarios' | 'roles'>('usuarios');
  usuarios = signal<Usuario[]>([]);
  permisos = signal<PermisoRbac[]>([]);
  roles = signal<RolRbac[]>([]);
  asignaciones = signal<Record<string, string[]>>({});
  rolSeleccionado = signal<RolRbac | null>(null);
  permisosEdit = signal<Set<string>>(new Set());
  busqueda = signal('');
  busquedaPermisos = signal('');
  mensaje = signal('');
  error = signal('');
  guardando = signal(false);
  form: Usuario = { nombre: '', email: '', contrasena: '', rol: 'VENDEDOR' };
  formRol = { clave: '', nombre: '', descripcion: '' };

  rolesPanel = computed(() =>
    this.roles().filter(r => r.accesoPanel !== false),
  );

  rolesAsignables = computed(() =>
    this.roles().filter(r => r.clave !== 'CLIENTE'),
  );

  permisosFiltrados = computed(() => {
    const q = this.busquedaPermisos().trim().toLowerCase();
    const list = this.permisos();
    if (!q) return list;
    return list.filter(p =>
      (p.clave ?? '').toLowerCase().includes(q)
      || (p.modulo ?? '').toLowerCase().includes(q)
      || (p.descripcion ?? '').toLowerCase().includes(q),
    );
  });

  permisosPorModulo = computed(() => {
    const map = new Map<string, PermisoRbac[]>();
    for (const p of this.permisosFiltrados()) {
      const mod = p.modulo ?? 'otros';
      if (!map.has(mod)) map.set(mod, []);
      map.get(mod)!.push(p);
    }
    return [...map.entries()];
  });

  usuariosFiltrados = computed(() => {
    const q = this.busqueda();
    return this.usuarios().filter(u =>
      coincideBusqueda(q, u.idUsuario, u.nombre, u.email, u.rol),
    );
  });

  constructor(
    private usuarioService: UsuarioService,
    private configModulo: ConfigModuloService,
    public permiso: PermisoService,
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRbac();
  }

  cargarUsuarios(): void {
    this.usuarioService.listar().subscribe(d => this.usuarios.set(d));
  }

  cargarRbac(): void {
    this.configModulo.matrizRbac().subscribe({
      next: m => {
        this.permisos.set(m.permisos ?? []);
        this.roles.set(m.roles ?? []);
        this.asignaciones.set(m.asignaciones ?? {});
        this.error.set('');
        const sel = this.rolSeleccionado();
        const clave = sel?.clave;
        const actualizado = clave
          ? m.roles.find(r => r.clave === clave) ?? m.roles.find(r => r.accesoPanel && !r.accesoTotal) ?? null
          : m.roles.find(r => r.accesoPanel && !r.accesoTotal) ?? m.roles[0] ?? null;
        this.seleccionarRol(actualizado);
        this.permiso.recargarMatriz();
      },
      error: err => {
        const raw = err?.error;
        const msg = typeof raw === 'string' && raw.includes('<!doctype')
          ? 'El servidor devolvió HTML en lugar de JSON (reiniciá backend y frontend con npm start)'
          : (raw?.message ?? err?.message ?? 'Error de conexión');
        this.error.set(`No se pudo cargar roles y permisos: ${msg}`);
      },
    });
  }

  seleccionarRol(rol: RolRbac | null): void {
    if (!rol) return;
    this.rolSeleccionado.set(rol);
    if (rol.accesoTotal) {
      this.permisosEdit.set(new Set(this.permisos().map(p => p.clave!)));
      return;
    }
    const lista = this.asignaciones()[rol.clave!] ?? [];
    this.permisosEdit.set(new Set(lista.filter(p => p !== '*')));
  }

  guardarUsuario(f: NgForm): void {
    if (f.invalid) return;
    this.usuarioService.crear(this.form).subscribe({
      next: () => {
        this.mensaje.set('Usuario creado correctamente');
        this.form = { nombre: '', email: '', contrasena: '', rol: 'VENDEDOR' };
        this.cargarUsuarios();
      },
      error: () => this.error.set('No se pudo crear el usuario'),
    });
  }

  borrarUsuario(id?: number): void {
    if (id == null || !this.permiso.puede('usuarios.deactivate')) return;
    this.usuarioService.eliminar(id).subscribe({
      next: () => {
        this.mensaje.set('Usuario eliminado');
        this.cargarUsuarios();
      },
      error: () => this.error.set('No se pudo eliminar el usuario'),
    });
  }

  crearRol(f: NgForm): void {
    if (f.invalid || !this.permiso.puedeGestionarRoles()) return;
    this.error.set('');
    this.guardando.set(true);
    this.configModulo.crearRol({
      clave: this.formRol.clave,
      nombre: this.formRol.nombre,
      descripcion: this.formRol.descripcion,
    }).subscribe({
      next: rol => {
        this.mensaje.set(`Rol ${rol.clave} creado`);
        this.formRol = { clave: '', nombre: '', descripcion: '' };
        this.guardando.set(false);
        this.cargarRbac();
        this.seleccionarRol(rol);
      },
      error: err => {
        this.guardando.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo crear el rol');
      },
    });
  }

  eliminarRol(): void {
    const rol = this.rolSeleccionado();
    if (!rol?.clave || rol.esSistema || !this.permiso.puedeGestionarRoles()) return;
    if (!confirm(`¿Eliminar el rol ${rol.clave}?`)) return;
    this.configModulo.eliminarRol(rol.clave).subscribe({
      next: () => {
        this.mensaje.set('Rol eliminado');
        this.rolSeleccionado.set(null);
        this.cargarRbac();
      },
      error: err => this.error.set(err?.error?.message ?? 'No se pudo eliminar el rol'),
    });
  }

  togglePermiso(clave: string): void {
    const rol = this.rolSeleccionado();
    if (!rol || rol.accesoTotal || !this.permiso.puedeGestionarRoles()) return;
    const set = new Set(this.permisosEdit());
    if (set.has(clave)) set.delete(clave);
    else set.add(clave);
    this.permisosEdit.set(set);
  }

  tienePermisoEdit(clave: string): boolean {
    const rol = this.rolSeleccionado();
    if (rol?.accesoTotal) return true;
    return this.permisosEdit().has(clave);
  }

  toggleModulo(modulo: string): void {
    const rol = this.rolSeleccionado();
    if (!rol || rol.accesoTotal || !this.permiso.puedeGestionarRoles()) return;
    const delModulo = this.permisos().filter(p => p.modulo === modulo).map(p => p.clave!);
    const set = new Set(this.permisosEdit());
    const todos = delModulo.every(c => set.has(c));
    for (const c of delModulo) {
      if (todos) set.delete(c);
      else set.add(c);
    }
    this.permisosEdit.set(set);
  }

  guardarPermisosRol(): void {
    const rol = this.rolSeleccionado();
    if (!rol?.clave || rol.accesoTotal || !this.permiso.puedeGestionarRoles()) return;
    this.guardando.set(true);
    this.configModulo.actualizarRol(rol.clave, [...this.permisosEdit()]).subscribe({
      next: () => {
        this.mensaje.set(`Permisos de ${rol.clave} guardados`);
        this.guardando.set(false);
        this.cargarRbac();
      },
      error: () => {
        this.error.set('No se pudieron guardar los permisos');
        this.guardando.set(false);
      },
    });
  }

  contarUsuariosRol(clave?: string): number {
    if (!clave) return 0;
    return this.usuarios().filter(u => u.rol === clave).length;
  }
}
