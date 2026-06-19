import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Pagina de registro de un cliente nuevo.
// Pide nombre, email y contrasena, y le pega a /auth/register.
// Si sale bien, automaticamente inicia sesion y lleva a la tienda.
@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {

  // Datos del formulario.
  nombre = '';
  email = '';
  contrasena = '';

  // Mensajes para el usuario.
  error = signal<string | null>(null);
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  // Se ejecuta al enviar el formulario.
  registrarse(): void {
    this.error.set(null);
    this.cargando.set(true);

    this.auth.register({ nombre: this.nombre, email: this.email, contrasena: this.contrasena }).subscribe({
      next: () => {
        // Registro OK: para que sea comodo, lo logueamos solo con los mismos datos.
        this.auth.login({ email: this.email, contrasena: this.contrasena }).subscribe({
          next: () => {
            this.cargando.set(false);
            this.router.navigate(['/']); // a la tienda
          },
          error: () => {
            // Si fallara el auto-login, lo mandamos al login manual.
            this.cargando.set(false);
            this.router.navigate(['/login']);
          },
        });
      },
      error: err => {
        this.cargando.set(false);
        // El backend devuelve 409 si el email ya existe.
        if (err?.status === 409) {
          this.error.set('Ya existe una cuenta con ese email.');
        } else {
          this.error.set('No se pudo crear la cuenta. Revisa los datos.');
        }
      },
    });
  }
}
