import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Componente del encabezado del PANEL ADMIN (la barra de arriba con el logo).
// Ademas del logo, muestra a la derecha el nombre del admin logueado,
// un acceso para "Ver tienda" y el boton para cerrar sesion.
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  // Inyectamos el servicio de autenticacion (para saber quien esta logueado y cerrar sesion)
  // y el Router (para movernos de pagina cuando hace falta).
  constructor(public auth: AuthService, private router: Router) {}

  // Cierra la sesion y manda al login.
  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}