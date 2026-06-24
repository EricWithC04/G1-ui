import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { CategoriaService } from '../../services/categoria.service';
import { CartService } from '../../services/cart.service';
import { CANAL_ECOMMERCE, normalizarPrecioCanal } from '../../utils/producto-canal.util';
import { etiquetaStock } from '../../utils/stock-inventario.util';
import { Product, Categoria } from '../../models/models';

// Pagina principal de la tienda (catalogo).
// Muestra los productos en tarjetas, permite buscar por nombre y filtrar por categoria,
// y agregar productos al carrito. Todo conectado al backend real.
/**
 * Página `catalogo`: pantalla Angular (componente + template) del módulo catalogo.
 */
@Component({
    selector: 'app-catalogo',
    imports: [FormsModule, RouterLink, DecimalPipe],
    templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {

    // Lista de productos que se ven (se llena desde el backend).
    productos = signal<Product[]>([]);
    // Lista de categorias para el desplegable del filtro.
    categorias = signal<Categoria[]>([]);

    // Texto del buscador y categoria elegida (0 = "todas").
    busqueda = '';
    categoriaId = 0;

    // Mensajito de "agregado al carrito" para dar feedback.
    agregado = signal<string | null>(null);

    // Datos para la tira de beneficios (banner 06 del diseño)
    beneficios = [
        { icon: '🚚', title: 'Envío gratis',    sub: 'en compras +$80.000',    bg: 'rgba(34,211,238,0.14)', border: 'rgba(34,211,238,0.35)' },
        { icon: '💳', title: '12 cuotas',        sub: 'sin interés',            bg: 'rgba(59,130,246,0.14)', border: 'rgba(59,130,246,0.35)' },
        { icon: '🛡️', title: 'Garantía oficial', sub: 'en todos los productos', bg: 'rgba(34,197,94,0.14)',  border: 'rgba(34,197,94,0.35)'  },
        { icon: '⚡',  title: 'Envío 24/72hs',   sub: 'a todo el país',         bg: 'rgba(249,115,22,0.14)', border: 'rgba(249,115,22,0.35)' },
    ];

    // Items del banner de periféricos (banner 05 del diseño)
    perifericos = [
        { icon: '⌨️', label: 'Teclado mecánico', accent: false },
        { icon: '🖱️', label: 'Mouse 16K DPI',     accent: false },
        { icon: '🎧', label: 'Headset 7.1',        accent: false },
        { icon: '',   label: '',                    accent: true  },
    ];

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private categoriaService: CategoriaService,
        private cart: CartService,
    ) { }

    ngOnInit(): void {
        this.categoriaService.listar().subscribe(cats => this.categorias.set(cats));
        // Leer búsqueda desde queryParam (viene del buscador del header).
        const q = this.route.snapshot.queryParamMap.get('q');
        if (q) {
            this.busqueda = q;
        }
        this.cargar();
    }

    cargar(): void {
        let filtros: { nombre?: string; categoriaId?: number } | undefined;
        if (this.busqueda.trim()) {
            filtros = { nombre: this.busqueda.trim() };
        } else if (this.categoriaId) {
            filtros = { categoriaId: this.categoriaId };
        }
        this.productService.listarConFiltros({ ...filtros, canal: CANAL_ECOMMERCE }).subscribe(items =>
            this.productos.set(items.map(p => normalizarPrecioCanal(p))),
        );
    }

    stockInfo(p: Product) {
        return etiquetaStock(p);
    }

    filtrarCategoria(id: number): void {
        this.categoriaId = id;
        this.busqueda = '';
        this.cargar();
        setTimeout(() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' }), 80);
    }

    cambiarCategoria(): void {
        this.busqueda = '';
        this.cargar();
    }

    scrollToProductos(): void {
        document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
    }

    agregarAlCarrito(producto: Product): void {
        this.cart.agregar(producto, 1);
        this.agregado.set(producto.nombre);
        setTimeout(() => this.agregado.set(null), 2000);
    }
}
