import { Component, input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  host: {
    class: "flex flex-col border-white/20 border-1 min-h-90 rounded-lg overflow-hidden"
  }
})
export class ProductCard {

  product = input.required<any>()

}
