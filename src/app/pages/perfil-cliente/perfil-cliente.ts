import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil-cliente',
  imports: [FormsModule],
  templateUrl: './perfil-cliente.html',
})
export class PerfilCliente implements OnInit {

  nombre = '';
  email = '';
  nuevaContrasena = '';

  guardado = signal(false);
  error = signal<string | null>(null);
  cargando = signal(true);

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    const sesion = this.auth.getUsuario();
    if (!sesion) {
      this.cargando.set(false);
      return;
    }
    this.nombre = sesion.nombre;
    this.email = sesion.email;
    this.cargando.set(false);
  }

  guardar(): void {
    const sesion = this.auth.getUsuario();
    if (!sesion) {
      return;
    }
    this.error.set(null);
    this.guardado.set(false);

    const payload: { nombre: string; email: string; contrasena?: string } = {
      nombre: this.nombre,
      email: this.email,
    };
    if (this.nuevaContrasena.trim()) {
      payload.contrasena = this.nuevaContrasena.trim();
    }

    this.auth.actualizarPerfil(payload).subscribe({
      next: () => {
        this.nuevaContrasena = '';
        this.guardado.set(true);
        setTimeout(() => this.guardado.set(false), 2500);
      },
      error: () => this.error.set('No se pudieron guardar los cambios.'),
    });
  }
}
