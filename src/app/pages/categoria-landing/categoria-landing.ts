import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart.service';
import { CATEGORIA_LANDINGS, CategoriaLandingConfig } from '../../data/landing-pages';
import { CANAL_ECOMMERCE, normalizarListaPrecioCanal } from '../../utils/producto-canal.util';
import { Product } from '../../models/models';

// Pagina dedicada de una categoria (ej: /notebooks, /monitores).
// Muestra un hero con info de la categoria y debajo el listado filtrado del backend.
@Component({
  selector: 'app-categoria-landing',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './categoria-landing.html',
})
export class CategoriaLanding implements OnInit {

  config = signal<CategoriaLandingConfig | null>(null);
  productos = signal<Product[]>([]);
  cargando = signal(true);
  agregado = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cart: CartService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const cfg = CATEGORIA_LANDINGS[slug];
    if (!cfg) {
      this.router.navigate(['/']);
      return;
    }
    this.config.set(cfg);
    this.productService.listarConFiltros({ categoriaId: cfg.categoriaId, canal: CANAL_ECOMMERCE }).subscribe({
      next: items => {
        this.productos.set(normalizarListaPrecioCanal(items));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  agregarAlCarrito(producto: Product): void {
    this.cart.agregar(producto, 1);
    this.agregado.set(producto.nombre);
    setTimeout(() => this.agregado.set(null), 2000);
  }
}
