import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  emailValidator,
  mensajeEmail,
  mensajeNombre,
  nombreValidator,
  primerErrorCampos,
} from '../../utils/validadores-form';

/**
 * Página `register`: pantalla Angular (componente + template) del módulo register.
 */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {

  readonly anio = new Date().getFullYear();
  form: FormGroup;

  error = signal<string | null>(null);
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), nombreValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  registrarse(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.cargando.set(true);

    const { nombre, email, contrasena } = this.form.value;
    this.auth.register({ nombre, email, contrasena }).subscribe({
      next: () => {
        this.auth.login({ email, contrasena }).subscribe({
          next: () => {
            this.cargando.set(false);
            this.router.navigate(['/']);
          },
          error: () => {
            this.cargando.set(false);
            this.router.navigate(['/login']);
          },
        });
      },
      error: err => {
        this.cargando.set(false);
        if (err?.status === 409) {
          this.error.set('Ya existe una cuenta con ese email.');
        } else if (err?.status === 400) {
          this.error.set(
            primerErrorCampos(err?.error?.fields) ?? 'Revisá los datos del formulario.',
          );
        } else {
          this.error.set('No se pudo crear la cuenta. Revisa los datos.');
        }
      },
    });
  }

  mensajeErrorCampo(campo: string): string | null {
    const c = this.form.get(campo);
    if (!c?.touched || !c.errors) return null;
    if (c.hasError('required')) return campo === 'nombre' ? 'Nombre requerido.' : campo === 'email' ? 'Email requerido.' : 'Contraseña requerida.';
    if (c.hasError('minlength')) return campo === 'nombre' ? 'Mínimo 2 caracteres.' : 'Mínimo 6 caracteres.';
    if (c.hasError('maxlength')) return 'Máximo 100 caracteres.';
    if (c.hasError('email')) return mensajeEmail();
    if (c.hasError('nombre')) return mensajeNombre();
    return null;
  }
}
