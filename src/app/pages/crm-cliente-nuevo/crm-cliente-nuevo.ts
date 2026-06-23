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

@Component({
  selector: 'app-crm-cliente-nuevo',
  imports: [FormsModule, RouterLink],
  templateUrl: './crm-cliente-nuevo.html',
})
export class CrmClienteNuevo implements OnInit {
  guardando = signal(false);
  error = signal('');

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

  guardar(f: NgForm): void {
    if (f.invalid) return;
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
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo crear el usuario (¿email duplicado?).');
      },
    });
  }
}
