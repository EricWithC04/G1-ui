import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/models';

// Pagina de PERFIL del cliente.
// Muestra los datos del usuario logueado y deja editarlos (nombre, email y,
// opcionalmente, una nueva contrasena). Guarda con PUT /usuarios/{id}.
@Component({
  selector: 'app-perfil-cliente',
  imports: [FormsModule],
  templateUrl: './perfil-cliente.html',
})
export class PerfilCliente implements OnInit {

  // Datos editables del formulario.
  nombre = '';
  email = '';
  nuevaContrasena = ''; // si queda vacio, NO se cambia la contrasena

  // Mensajes para el usuario.
  guardado = signal(false);
  error = signal<string | null>(null);
  cargando = signal(true);

  constructor(private usuarioService: UsuarioService, private auth: AuthService) {}

  ngOnInit(): void {
    const sesion = this.auth.getUsuario();
    if (!sesion) {
      return;
    }
    // Traemos los datos completos del usuario desde el backend para mostrarlos.
    this.usuarioService.obtener(sesion.idUsuario).subscribe({
      next: u => {
        this.nombre = u.nombre;
        this.email = u.email;
        this.cargando.set(false);
      },
      error: () => {
        // Si fallara, al menos usamos lo que tenemos en la sesion.
        this.nombre = sesion.nombre;
        this.email = sesion.email;
        this.cargando.set(false);
      },
    });
  }

  // Guarda los cambios del perfil.
  guardar(): void {
    const sesion = this.auth.getUsuario();
    if (!sesion) {
      return;
    }
    this.error.set(null);
    this.guardado.set(false);

    // Armamos el usuario a actualizar. Mantenemos el rol que ya tenia.
    // La contrasena solo se manda si el usuario escribio una nueva.
    const datos: Usuario = {
      nombre: this.nombre,
      email: this.email,
      rol: sesion.rol,
    };
    if (this.nuevaContrasena.trim()) {
      datos.contrasena = this.nuevaContrasena.trim();
    }

    this.usuarioService.actualizar(sesion.idUsuario, datos).subscribe({
      next: actualizado => {
        // Actualizamos tambien la sesion guardada (nombre/email pueden haber cambiado).
        this.auth.guardarSesion({
          idUsuario: sesion.idUsuario,
          nombre: actualizado.nombre,
          email: actualizado.email,
          rol: sesion.rol,
        });
        this.nuevaContrasena = '';
        this.guardado.set(true);
        setTimeout(() => this.guardado.set(false), 2500);
      },
      error: () => this.error.set('No se pudieron guardar los cambios.'),
    });
  }
}
