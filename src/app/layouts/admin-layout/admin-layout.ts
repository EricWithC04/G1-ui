import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';

// Layout (marco) del PANEL DE ADMINISTRACION.
// Es lo que se ve en todas las pantallas que cuelgan de /admin:
//   - arriba el encabezado (Header) con el logo,
//   - a la izquierda el menu lateral (Sidebar) con los modulos,
//   - a la derecha el contenido de la pagina actual (<router-outlet>).
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {}
