import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart.service';
import { PROMO_LANDINGS, PromoLandingConfig } from '../../data/landing-pages';
import { Product } from '../../models/models';

// Pagina de promociones especiales (Hot Sale, Cyber Week).
// Muestra un hero de la promo y el listado de productos incluidos.
@Component({
  selector: 'app-promo-landing',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './promo-landing.html',
})
export class PromoLanding implements OnInit {

  config = signal<PromoLandingConfig | null>(null);
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
    // El slug viene de la ruta (hot-sale, cyber-week).
    const slug = this.route.snapshot.routeConfig?.path ?? '';
    const cfg = PROMO_LANDINGS[slug];
    if (!cfg) {
      this.router.navigate(['/']);
      return;
    }
    this.config.set(cfg);

    const filtros = cfg.categoriaId ? { categoriaId: cfg.categoriaId } : undefined;
    this.productService.listarConFiltros(filtros).subscribe({
      next: items => {
        this.productos.set(items);
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
