import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductService } from '../../services/product';
import { Product } from '../../models/models';

// Pagina que lista todos los productos.
// Permite buscar por nombre, crear uno nuevo, editar y borrar.
@Component({
  selector: 'app-product-list',
  imports: [ProductCard, FormsModule],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit {

  // Lista de productos que mostramos. Empieza vacia y se llena con el backend.
  products = signal<Product[]>([]);

  // Texto que escribe el usuario en el buscador.
  busqueda = '';

  constructor(
    private productService: ProductService,
    private router: Router,
  ) {}

  // Al cargar la pagina, traemos todos los productos.
  ngOnInit(): void {
    this.cargar();
  }

  // Pide los productos al backend. Si hay texto en el buscador, filtra por nombre.
  cargar(): void {
    const filtros = this.busqueda.trim() ? { nombre: this.busqueda.trim() } : undefined;
    this.productService.listarConFiltros(filtros).subscribe(products => {
      this.products.set(products);
    });
  }

  // Va al formulario para crear un producto nuevo (dentro del panel admin).
  nuevo(): void {
    this.router.navigate(['/admin/productos/nuevo']);
  }

  // Va al formulario de edicion del producto elegido (dentro del panel admin).
  editar(id: number): void {
    this.router.navigate(['/admin/productos', id, 'editar']);
  }

  // Borra el producto y vuelve a cargar la lista si salio bien.
  borrar(id: number): void {
    this.productService.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: err => console.error('Error al borrar producto', err),
    });
  }
}