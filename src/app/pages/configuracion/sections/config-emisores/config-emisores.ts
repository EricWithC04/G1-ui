import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { ConfigModuloService } from '../../../../services/config-modulo.service';
import { PermisoService } from '../../../../services/permiso.service';
import { CONDICIONES_IVA } from '../../../../models/condiciones-iva';
import { Emisor } from '../../../../models/models';
import { esCuitValido, mensajeCuit } from '../../../../utils/validadores-admin';

@Component({
  selector: 'app-config-emisores',
  imports: [ConfigPageShell, FormsModule],
  templateUrl: './config-emisores.html',
})
export class ConfigEmisores implements OnInit {
  emisores = signal<Emisor[]>([]);
  editando = signal<Emisor | null>(null);
  mensaje = signal('');
  error = signal('');

  form: Emisor = { ambiente: 'HOMOLOGACION', esDefault: false, puntoVenta: 1 };
  condicionesIva = CONDICIONES_IVA;

  constructor(private configModulo: ConfigModuloService, public permiso: PermisoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.configModulo.listarEmisores().subscribe(d => this.emisores.set(d));
  }

  nuevo(): void {
    this.editando.set(null);
    this.form = { ambiente: 'HOMOLOGACION', esDefault: false, puntoVenta: 1 };
  }

  editar(e: Emisor): void {
    this.editando.set(e);
    this.form = { ...e };
  }

  guardar(): void {
    if (!esCuitValido(this.form.cuit ?? '')) {
      this.error.set(mensajeCuit());
      return;
    }
    this.error.set('');
    const op = this.editando()?.idEmisor
      ? this.configModulo.actualizarEmisor(this.editando()!.idEmisor!, this.form)
      : this.configModulo.crearEmisor(this.form);
    op.subscribe({
      next: () => {
        this.mensaje.set(this.editando() ? 'Emisor actualizado' : 'Emisor creado');
        this.nuevo();
        this.cargar();
      },
      error: () => this.error.set('No se pudo guardar el emisor'),
    });
  }

  eliminar(id?: number): void {
    if (id == null || !this.permiso.puede('emisores.delete')) return;
    this.configModulo.eliminarEmisor(id).subscribe({
      next: () => { this.mensaje.set('Emisor eliminado'); this.cargar(); },
      error: () => this.error.set('No se pudo eliminar'),
    });
  }
}
