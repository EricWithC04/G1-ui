import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../../services/perfil.service';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilCliente, Usuario } from '../../models/models';

// Pagina del modulo de Perfiles de cliente (datos extra de un usuario cliente).
@Component({
  selector: 'app-perfiles',
  imports: [FormsModule],
  templateUrl: './perfiles.html',
})
export class Perfiles implements OnInit {

  items = signal<PerfilCliente[]>([]);

  // Lista de usuarios para el desplegable (un perfil pertenece a un usuario).
  usuarios = signal<Usuario[]>([]);

  // Formulario. El usuario se elige por id en el desplegable.
  form: PerfilCliente = {
    usuario: { idUsuario: undefined } as Usuario,
    direccion: '',
    telefono: '',
    historialCrediticio: 0,
    tipoCliente: 'MINORISTA',
  };

  constructor(
    private service: PerfilService,
    private usuarioService: UsuarioService,
  ) {}

  ngOnInit(): void {
    this.cargar();
    // Traemos los usuarios para poder elegir a quien pertenece el perfil.
    this.usuarioService.listar().subscribe(data => this.usuarios.set(data));
  }

  cargar(): void {
    this.service.listar().subscribe(data => this.items.set(data));
  }

  guardar(): void {
    this.service.crear(this.form).subscribe({
      next: () => {
        this.form = {
          usuario: { idUsuario: undefined } as Usuario,
          direccion: '', telefono: '', historialCrediticio: 0, tipoCliente: 'MINORISTA',
        };
        this.cargar();
      },
      error: err => console.error('Error al crear perfil', err),
    });
  }

  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: err => console.error('Error al borrar perfil', err),
    });
  }
}
