import { Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LucideSquarePen, LucideTrash2 } from '@lucide/angular';

// Tarjeta que muestra un producto (nombre, proveedor, precio) con botones
// para editar y borrar. No sabe nada del backend: solo recibe el producto
// y avisa "hacia afuera" cuando el usuario quiere editar o borrar.
@Component({
  selector: 'app-product-card',
  imports: [DecimalPipe, LucideSquarePen, LucideTrash2],
  templateUrl: './product-card.html',
  host: {
    class: 'flex flex-col border-white/20 border min-h-72 rounded-lg overflow-hidden bg-gray-800'
  }
})
export class ProductCard {

  // input.required: el producto que recibimos del componente padre (la lista).
  // Es obligatorio, por eso ".required".
  product = input.required<any>();

  // output: "eventos" que la tarjeta emite hacia el padre.
  // El padre (la lista) escucha estos eventos y hace el trabajo real.
  editar = output<number>();
  borrar = output<number>();

  // Cuando aprietan el lapiz, avisamos al padre con el id del producto.
  onEditar() {
    this.editar.emit(this.product().idProducto);
  }

  // Cuando aprietan el tacho, avisamos al padre con el id del producto.
  onBorrar() {
    this.borrar.emit(this.product().idProducto);
  }
}
