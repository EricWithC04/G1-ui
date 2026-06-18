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
  newProduct: any = {
    "nombre": "Notebook HP 15",
    "descripcion": "Intel i5, 8GB RAM, 256GB SSD",
    "precio": 620000.00,
    "stock": 10,
    "proveedor": "HP",
    "categoria": { "idCategoria": 1 }
  }

  constructor(
    private productService: ProductService,
    private cdf: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.productService.getProducts()
      .subscribe(products => {
        this.products = products
        this.cdf.detectChanges()
      })

  }

  saveProduct() {
    this.productService.createProduct(this.newProduct)
      .subscribe({
        next: (response) => {
          console.log('Producto creado', response);
          window.location.reload();
        },
        error: (err) => {
          console.error('Error al crear producto', err);
        }
      })
  }
}
