import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-product-list',
  imports: [Header, Sidebar, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products: any[] = [];

  constructor(
    private productService: ProductService,
    private cdf: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    
    this.productService.getProducts()
      .subscribe(products => {
        this.products = products
        this.cdf.detectChanges()
      })

  }
}
