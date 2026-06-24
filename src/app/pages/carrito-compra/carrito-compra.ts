import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';

// Pagina del CARRITO de compras.
// Muestra los productos que el cliente fue agregando (guardados en el navegador),
// permite cambiar cantidades y quitar productos, y muestra el total a pagar.
/**
 * Página `carrito-compra`: pantalla Angular (componente + template) del módulo carrito-compra.
 */
@Component({
  selector: 'app-carrito-compra',
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './carrito-compra.html',
})
export class CarritoCompra {

  // El servicio del carrito es publico para poder leer items/total directo en el HTML.
  constructor(public cart: CartService) {}

  // Cambia la cantidad de un producto. Recibe el id y la nueva cantidad.
  cambiar(idProducto: number | undefined, cantidad: number): void {
    if (idProducto != null) {
      this.cart.cambiarCantidad(idProducto, Number(cantidad));
    }
  }

  // Quita un producto del carrito.
  quitar(idProducto: number | undefined): void {
    if (idProducto != null) {
      this.cart.quitar(idProducto);
    }
  }
}
