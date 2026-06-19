import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { CategoriaService } from '../../services/categoria.service';
import { CartService } from '../../services/cart.service';
import { Product, Categoria } from '../../models/models';

// Pagina principal de la tienda (catalogo).
// Muestra los productos en tarjetas, permite buscar por nombre y filtrar por categoria,
// y agregar productos al carrito. Todo conectado al backend real.
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

    constructor(
        private productService: ProductService,
        private categoriaService: CategoriaService,
        private cart: CartService,
    ) { }

    ngOnInit(): void {
        // Traemos las categorias una vez (para el filtro).
        this.categoriaService.listar().subscribe(cats => this.categorias.set(cats));
        // Y la primera carga de productos (todos).
        this.cargar();
    }

    // Pide los productos al backend aplicando el filtro actual.
    // El backend acepta UN filtro a la vez: si hay texto, busca por nombre;
    // si no, y hay categoria elegida, filtra por categoria.
    cargar(): void {
        let filtros: { nombre?: string; categoriaId?: number } | undefined;
        if (this.busqueda.trim()) {
            filtros = { nombre: this.busqueda.trim() };
        } else if (this.categoriaId) {
            filtros = { categoriaId: this.categoriaId };
        }
        this.productService.listarConFiltros(filtros).subscribe(items => this.productos.set(items));
    }

    // Cuando cambian el desplegable de categoria, limpiamos la busqueda y recargamos.
    cambiarCategoria(): void {
        this.busqueda = '';
        this.cargar();
    }

    // Agrega un producto al carrito y muestra un aviso corto.
    agregarAlCarrito(producto: Product): void {
        this.cart.agregar(producto, 1);
        this.agregado.set(producto.nombre);
        // Borramos el aviso despues de 2 segundos.
        setTimeout(() => this.agregado.set(null), 2000);
    }
}
