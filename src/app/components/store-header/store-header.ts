import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideShoppingCart, LucideUser, LucideSearch } from '@lucide/angular';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { esRolPanelAdmin } from '../../config/config-rbac';

// Encabezado de la TIENDA (storefront). Lo ve el cliente en todas las paginas publicas.
// Muestra: el logo, el link al catalogo, el icono del carrito con la cantidad de items,
// y a la derecha el login o (si ya inicio sesion) su nombre + accesos + cerrar sesion.
@Component({
  selector: 'app-store-header',
  imports: [RouterLink, RouterLinkActive, FormsModule, LucideShoppingCart, LucideUser, LucideSearch],
  templateUrl: './store-header.html',
})
export class StoreHeader implements OnInit {

  busquedaHeader = '';
  readonly esRolPanelAdmin = esRolPanelAdmin;

  constructor(public auth: AuthService, public cart: CartService, private router: Router) {}

  ngOnInit() {
    // console.log(this.auth.usuarioActual());
  }

  buscar(): void {
    const q = this.busquedaHeader.trim();
    if (q) {
      this.router.navigate(['/'], { queryParams: { q } });
      this.busquedaHeader = '';
    }
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
