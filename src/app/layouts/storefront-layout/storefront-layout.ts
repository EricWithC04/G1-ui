import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { StoreHeader } from '../../components/store-header/store-header';

// Layout (marco) de la TIENDA (storefront).
// Envuelve todas las paginas publicas/cliente:
//   - arriba el encabezado de la tienda (StoreHeader),
//   - en el medio el contenido de la pagina actual (<router-outlet>),
//   - abajo un pie de pagina (footer) con el logo chico.
@Component({
  selector: 'app-storefront-layout',
  imports: [RouterOutlet, RouterLink, StoreHeader],
  templateUrl: './storefront-layout.html',
})
export class StorefrontLayout {

  // Anio actual para mostrarlo en el footer (ej: "2026").
  readonly anio = new Date().getFullYear();
}