import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ConfigPageShell } from '../../../../components/config-page-shell/config-page-shell';
import { ConfiguracionService } from '../../../../services/configuracion.service';
import { ConfigModuloService } from '../../../../services/config-modulo.service';
import { RegistroAuditoria } from '../../../../models/models';

@Component({
  selector: 'app-config-seguridad',
  imports: [ConfigPageShell, FormsModule, DatePipe],
  templateUrl: './config-seguridad.html',
})
export class ConfigSeguridad implements OnInit {
  campos = signal<{ clave: string; label: string; valor: string; tipo?: string }[]>([]);
  eventosLogin = signal<RegistroAuditoria[]>([]);
  guardando = signal(false);
  mensaje = signal('');

  constructor(
    private configService: ConfiguracionService,
    private configModulo: ConfigModuloService,
  ) {}

  ngOnInit(): void {
    this.configService.mapaGrupo('seguridad').subscribe(mapa => {
      this.campos.set([
        { clave: 'password_min_length', label: 'Longitud mínima contraseña', valor: mapa['password_min_length'] ?? '8', tipo: 'integer' },
        { clave: 'password_require_upper', label: 'Requerir mayúscula', valor: mapa['password_require_upper'] ?? 'true', tipo: 'checkbox' },
        { clave: 'password_require_number', label: 'Requerir número', valor: mapa['password_require_number'] ?? 'true', tipo: 'checkbox' },
        { clave: 'password_require_special', label: 'Requerir carácter especial', valor: mapa['password_require_special'] ?? 'false', tipo: 'checkbox' },
        { clave: 'login_max_intentos', label: 'Intentos máximos de login', valor: mapa['login_max_intentos'] ?? '5', tipo: 'integer' },
        { clave: 'login_bloqueo_minutos', label: 'Bloqueo (minutos)', valor: mapa['login_bloqueo_minutos'] ?? '15', tipo: 'integer' },
        { clave: 'sesion_max_dias', label: 'Sesión máxima (días)', valor: mapa['sesion_max_dias'] ?? '7', tipo: 'integer' },
        { clave: 'totp_habilitado', label: '2FA TOTP habilitado', valor: mapa['totp_habilitado'] ?? 'false', tipo: 'checkbox' },
      ]);
    });
    this.configModulo.auditoria({ entidad: 'Auth' }).subscribe(r => this.eventosLogin.set(r.slice(0, 10)));
  }

  guardar(): void {
    const valores: Record<string, string> = {};
    for (const c of this.campos()) valores[c.clave] = c.valor;
    this.guardando.set(true);
    this.configService.guardarGrupo('seguridad', valores).subscribe({
      next: () => { this.mensaje.set('Política de seguridad guardada'); this.guardando.set(false); },
      error: () => this.guardando.set(false),
    });
  }

  setCheckbox(c: { valor: string }, checked: boolean): void {
    c.valor = checked ? 'true' : 'false';
  }
}
