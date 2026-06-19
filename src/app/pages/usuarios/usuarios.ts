import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/models';

// Pagina del modulo de Usuarios (clientes y administradores).
@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {

  items = signal<Usuario[]>([]);

  // Formulario para crear un usuario nuevo. Por defecto el rol es CLIENTE.
  form: Usuario = { nombre: '', email: '', contrasena: '', rol: 'CLIENTE' };

  constructor(private service: UsuarioService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.listar().subscribe(data => this.items.set(data));
  }

  guardar(): void {
    this.service.crear(this.form).subscribe({
      next: () => {
        this.form = { nombre: '', email: '', contrasena: '', rol: 'CLIENTE' };
        this.cargar();
      },
      error: err => console.error('Error al crear usuario', err),
    });
  }

  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: err => console.error('Error al borrar usuario', err),
    });
  }
}
