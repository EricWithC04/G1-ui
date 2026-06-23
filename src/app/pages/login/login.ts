import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { esRolPanelAdmin } from '../../config/config-rbac';
import { emailValidator, mensajeEmail, primerErrorCampos } from '../../utils/validadores-form';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {

  readonly anio = new Date().getFullYear();
  form: FormGroup;

  error = signal<string | null>(null);
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, emailValidator()]],
      contrasena: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  iniciarSesion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.cargando.set(true);

    const { email, contrasena } = this.form.value;
    this.auth.login({ email, contrasena }).subscribe({
      next: usuario => {
        this.cargando.set(false);
        if (esRolPanelAdmin(usuario.rol)) {
          this.router.navigate(['/admin'], { replaceUrl: true });
        } else {
          this.router.navigate(['/'], { replaceUrl: true });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        if (err.status === 401) {
          this.error.set('Email o contrasena incorrectos.');
        } else if (err.status === 400) {
          this.error.set(primerErrorCampos(err.error?.fields) ?? 'Revisá los datos ingresados.');
        } else if (err.status === 0) {
          this.error.set('No se pudo conectar con el servidor. Revisa tu conexion o el tunel/proxy.');
        } else {
          this.error.set('Error al iniciar sesion (codigo ' + err.status + '). Intenta de nuevo en un momento.');
        }
      },
    });
  }

  mensajeErrorCampo(campo: 'email' | 'contrasena'): string | null {
    const c = this.form.get(campo);
    if (!c?.touched || !c.errors) return null;
    if (c.hasError('required')) return campo === 'email' ? 'Email requerido.' : 'Contraseña requerida.';
    if (c.hasError('email')) return mensajeEmail();
    return null;
  }
}
