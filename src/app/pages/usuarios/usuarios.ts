import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { AdminSearch } from '../../components/admin-search/admin-search';
import { coincideBusqueda } from '../../utils/busqueda-admin';
import { Usuario } from '../../models/models';

// Pagina del modulo de Usuarios (clientes y administradores).
@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, AdminSearch],
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {

  items = signal<Usuario[]>([]);
  busqueda = signal('');

  itemsFiltrados = computed(() => {
    const q = this.busqueda();
    return this.items().filter(u =>
      coincideBusqueda(q, u.idUsuario, u.nombre, u.email, u.rol),
    );
  });

  // Formulario para crear un usuario nuevo. Por defecto el rol es CLIENTE.
  form: Usuario = { nombre: '', email: '', contrasena: '', rol: 'CLIENTE' };

  constructor(private service: UsuarioService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.listar().subscribe(data => this.items.set(data));
  }

  guardar(f: NgForm): void {
    if (f.invalid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.service.crear(this.form).subscribe({
      next: () => {
        this.form = { nombre: '', email: '', contrasena: '', rol: 'CLIENTE' };
        this.cargar();
      },
      error: err => console.error('Error al crear usuario', err),
    });
    Object.values(f.controls).forEach(c => c.markAsUntouched());
  }

  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: err => console.error('Error al borrar usuario', err),
    });
  }
}
