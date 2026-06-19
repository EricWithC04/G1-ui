import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideShoppingCart, LucideUser } from '@lucide/angular';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

// Encabezado de la TIENDA (storefront). Lo ve el cliente en todas las paginas publicas.
// Muestra: el logo, el link al catalogo, el icono del carrito con la cantidad de items,
// y a la derecha el login o (si ya inicio sesion) su nombre + accesos + cerrar sesion.
@Component({
  selector: 'app-store-header',
  imports: [RouterLink, RouterLinkActive, LucideShoppingCart, LucideUser],
  templateUrl: './store-header.html',
})
export class StoreHeader {

  // auth (publico) para leer el usuario en el template; cart para el contador del carrito.
  constructor(public auth: AuthService, public cart: CartService, private router: Router) {}

  // Cierra la sesion y vuelve al catalogo.
  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
