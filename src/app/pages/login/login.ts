import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Pagina de inicio de sesion.
// Tiene un formulario con email y contrasena. Al enviarlo, le pega al backend
// (/auth/login). Si la respuesta es correcta, guarda la sesion y redirige:
//   ADMIN  -> /admin   (panel de administracion)
//   CLIENTE -> /       (tienda)
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {

  // Datos del formulario (conectados con [(ngModel)] en el HTML).
  email = '';
  contrasena = '';

  // Mensaje de error para mostrar si el login falla (signal = reactivo).
  error = signal<string | null>(null);
  // Mientras esperamos la respuesta del backend, deshabilitamos el boton.
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  // Se ejecuta al enviar el formulario.
  iniciarSesion(): void {
    this.error.set(null);
    this.cargando.set(true);

    this.auth.login({ email: this.email, contrasena: this.contrasena }).subscribe({
      next: usuario => {
        this.cargando.set(false);
        // Segun el rol, mandamos a un lado u otro.
        if (usuario.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        // Solo el 401 significa "credenciales incorrectas". Cualquier otro caso
        // (status 0 = no se llego al servidor / fallo el tunel o el proxy, 5xx =
        // error del servidor) NO es culpa de la contrasena: avisamos algo acorde
        // para no confundir al usuario haciendole creer que tipeo mal.
        if (err.status === 401) {
          this.error.set('Email o contrasena incorrectos.');
        } else if (err.status === 0) {
          this.error.set('No se pudo conectar con el servidor. Revisa tu conexion o el tunel/proxy.');
        } else {
          this.error.set('Error al iniciar sesion (codigo ' + err.status + '). Intenta de nuevo en un momento.');
        }
      },
    });
  }
}
