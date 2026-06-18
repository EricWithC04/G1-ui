import { Component, input, output } from '@angular/core';
import { LucideSquarePen, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-product-card',
  imports: [LucideSquarePen, LucideTrash2],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  host: {
    class: "flex flex-col border-white/20 border-1 min-h-90 rounded-lg overflow-hidden"
  }
})
export class ProductCard {

  product = input.required<any>()

  delete = output<number>();

  onDelete() {
    this.delete.emit(this.product().idProducto);
  }
}
