import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Pagina de registro de un cliente nuevo.
// Pide nombre, email y contrasena, y le pega a /auth/register.
// Si sale bien, automaticamente inicia sesion y lleva a la tienda.
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {

  readonly anio = new Date().getFullYear();
  form: FormGroup;

  // Mensajes para el usuario.
  error = signal<string | null>(null);
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Se ejecuta al enviar el formulario.
  registrarse(): void {
    if (this.form.invalid) return;
    
    this.error.set(null);
    this.cargando.set(true);

    const { nombre, email, contrasena } = this.form.value;
    this.auth.register({ nombre, email, contrasena }).subscribe({
      next: () => {
        // Registro OK: para que sea comodo, lo logueamos solo con los mismos datos.
        this.auth.login({ email, contrasena }).subscribe({
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
