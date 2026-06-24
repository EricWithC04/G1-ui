import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * Layout `crm-layout`: marco visual (header/sidebar/outlet) de una zona del sitio.
 */
@Component({
  selector: 'app-crm-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './crm-layout.html',
  styleUrl: './crm-layout.css',
})
export class CrmLayout {
  tabs = [
    { path: 'clientes', label: 'Clientes' },
    { path: 'inbox', label: 'Bandeja' },
  ];
}
