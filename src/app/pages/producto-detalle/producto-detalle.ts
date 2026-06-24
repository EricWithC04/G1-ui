import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product';
import { ResenaService } from '../../services/resena.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CANAL_ECOMMERCE, normalizarPrecioCanal } from '../../utils/producto-canal.util';
import { etiquetaStock } from '../../utils/stock-inventario.util';
import { Product, Resena } from '../../models/models';

// Pagina de detalle de un producto.
// Muestra la info del producto, deja elegir cantidad y agregarlo al carrito,
// y lista las resenas (opiniones) que otros usuarios dejaron de ese producto.
/**
 * Página `producto-detalle`: pantalla Angular (componente + template) del módulo producto-detalle.
 */
@Component({
  selector: 'app-producto-detalle',
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './producto-detalle.html',
})
export class ProductoDetalle implements OnInit {

  // El producto que estamos viendo (null mientras carga).
  producto = signal<Product | null>(null);
  // Las resenas del producto.
  resenas = signal<Resena[]>([]);
  // Cantidad que el usuario quiere agregar al carrito.
  cantidad = 1;
  // Aviso de "agregado al carrito".
  agregado = signal(false);

  // --- Datos del formulario para dejar una resena nueva ---
  // Texto del comentario que escribe el usuario.
  nuevoComentario = '';
  // Puntuacion elegida (de 1 a 5 estrellas). Arranca en 5.
  nuevaPuntuacion = 5;
  // Mientras se esta enviando la resena, deshabilitamos el boton.
  enviando = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private resenaService: ResenaService,
    private cart: CartService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    // Leemos el id del producto desde la URL (/producto/:id).
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    // Pedimos el producto al backend con precio canal ecommerce.
    this.productService.obtenerPorCanal(id, CANAL_ECOMMERCE).subscribe({
      next: p => this.producto.set(normalizarPrecioCanal(p)),
      error: () => this.router.navigate(['/']),
    });

    // Pedimos las resenas de ese producto (/resenas?productoId=id).
    this.cargarResenas(id);
  }

  // Pide al backend las resenas del producto y las guarda en el signal.
  // Lo separamos en un metodo porque lo usamos al cargar la pagina
  // y tambien despues de crear una resena nueva (para refrescar la lista).
  private cargarResenas(productoId: number): void {
    this.resenaService.listarPorProducto(productoId).subscribe(rs => this.resenas.set(rs));
  }

  stockInfo(p: Product) {
    return etiquetaStock(p);
  }

  // Promedio simple de estrellas (para mostrar la nota general del producto).
  get promedio(): number {
    const rs = this.resenas();
    if (rs.length === 0) {
      return 0;
    }
    const suma = rs.reduce((acc, r) => acc + (r.puntuacion || 0), 0);
    return suma / rs.length;
  }

// Para que no se puedan colocar caracteres raros en los inputs de numeros
  bloquearCaracteresInvalidos(event: KeyboardEvent): void {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
}

  aumentarCantidad(): void { this.cantidad++; }
  disminuirCantidad(): void { if (this.cantidad > 1) this.cantidad--; }

  agregarAlCarrito(): void {
    const p = this.producto();
    if (!p) {
      return;
    }
    this.cart.agregar(p, Math.max(1, this.cantidad));
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 2000);
  }

  // true si hay un usuario logueado. El template lo usa para decidir
  // si muestra el formulario de resena o el cartel de "inicia sesion".
  get estaLogueado(): boolean {
    return this.auth.isLoggedIn();
  }

  // Envia la resena nueva al backend (POST /resenas).
  enviarResena(): void {
    const p = this.producto();
    const usuario = this.auth.getUsuario();

    // Si no hay producto cargado o el usuario no esta logueado, no hacemos nada.
    if (!p || !usuario) {
      return;
    }
    // El comentario no puede estar vacio.
    if (!this.nuevoComentario.trim()) {
      return;
    }

    // Armamos el cuerpo que espera el backend: los relacionados van como
    // objetos anidados con solo su id (producto e usuario). La fecha la
    // mandamos en formato local (sin zona horaria) para que la entienda
    // el LocalDateTime de Java; igual el backend la completa si falta.
    const resena = {
      producto: { idProducto: p.idProducto },
      usuario: { idUsuario: usuario.idUsuario },
      comentario: this.nuevoComentario.trim(),
      puntuacion: this.nuevaPuntuacion,
      fecha: new Date().toISOString().slice(0, 19),
    } as unknown as Resena;

    this.enviando.set(true);
    this.resenaService.crear(resena).subscribe({
      next: () => {
        // Limpiamos el formulario y refrescamos la lista de resenas.
        this.nuevoComentario = '';
        this.nuevaPuntuacion = 5;
        this.enviando.set(false);
        this.cargarResenas(p.idProducto!);
      },
      error: () => this.enviando.set(false),
    });
  }
}
