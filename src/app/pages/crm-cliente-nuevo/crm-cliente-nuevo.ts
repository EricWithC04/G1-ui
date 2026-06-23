import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ClienteCrmService } from '../../services/cliente-crm.service';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilCliente, Usuario } from '../../models/models';
import {
  CONDICIONES_IVA,
  defaultCondicionIvaPorTipoCliente,
} from '../../models/condiciones-iva';
import { TIPOS_CLIENTE, TIPO_CLIENTE_DEFAULT } from '../../models/tipos-cliente';
import {
  esCuitValido,
  esEmailValido,
  esTelefonoValido,
  mensajeCuit,
  mensajeEmail,
  mensajeTelefono,
  primerErrorCampos,
} from '../../utils/validadores-form';

@Component({
  selector: 'app-crm-cliente-nuevo',
  imports: [FormsModule, RouterLink],
  templateUrl: './crm-cliente-nuevo.html',
})
export class CrmClienteNuevo implements OnInit {
  guardando = signal(false);
  error = signal('');
  errores = signal<Record<string, string>>({});

  form: PerfilCliente = {
    usuario: { nombre: '', email: '', contrasena: '', rol: 'CLIENTE' },
    tipoCliente: TIPO_CLIENTE_DEFAULT,
    direccion: '',
    ciudad: '',
    telefono: '',
    cuit: '',
    contacto: '',
    condicionIva: defaultCondicionIvaPorTipoCliente(TIPO_CLIENTE_DEFAULT),
    activo: true,
  };

  tipos = TIPOS_CLIENTE;
  condicionesIva = CONDICIONES_IVA;

  constructor(
    private clienteCrm: ClienteCrmService,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const nombre = this.route.snapshot.queryParamMap.get('nombre');
    const email = this.route.snapshot.queryParamMap.get('email');
    if (nombre) this.form.usuario.nombre = nombre;
    if (email) this.form.usuario.email = email;
    if (nombre && !this.form.contacto) this.form.contacto = nombre;
  }

  onTipoChange(): void {
    this.form.condicionIva = defaultCondicionIvaPorTipoCliente(this.form.tipoCliente);
  }

  private validarFormulario(): boolean {
    const e: Record<string, string> = {};
    const u = this.form.usuario;
    if (!u.nombre?.trim()) e['nombre'] = 'Nombre requerido.';
    if (!esEmailValido(u.email)) e['email'] = mensajeEmail();
    if (!u.contrasena || u.contrasena.length < 8) {
      e['contrasena'] = 'Contraseña requerida (mínimo 8 caracteres).';
    }
    const tel = this.form.telefono?.trim();
    if (tel && !esTelefonoValido(tel)) e['telefono'] = mensajeTelefono();
    const cuit = this.form.cuit?.trim();
    if (cuit && !esCuitValido(cuit)) e['cuit'] = mensajeCuit();
    this.errores.set(e);
    return Object.keys(e).length === 0;
  }

  errorCampo(campo: string): string | null {
    return this.errores()[campo] ?? null;
  }

  guardar(f: NgForm): void {
    if (!this.validarFormulario()) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }
    if (f.invalid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    const u = this.form.usuario;
    this.usuarioService.crear(u as Usuario).subscribe({
      next: creado => {
        const perfil: PerfilCliente = {
          ...this.form,
          usuario: { idUsuario: creado.idUsuario } as Usuario,
        };
        this.clienteCrm.crear(perfil).subscribe({
          next: p => {
            this.guardando.set(false);
            this.router.navigate(['/admin/crm/clientes', p.idCliente]);
          },
          error: () => {
            this.guardando.set(false);
            this.error.set('No se pudo crear el perfil del cliente.');
          },
        });
      },
      error: err => {
        this.guardando.set(false);
        const fieldMsg = primerErrorCampos(err?.error?.fields);
        this.error.set(fieldMsg ?? 'No se pudo crear el usuario (¿email duplicado?).');
      },
    });
  }
}
