import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { CategoriaService } from '../../services/categoria.service';
import { Product, Categoria } from '../../models/models';

// Pagina con el formulario de producto.
// Sirve para DOS cosas segun la URL:
//   /productos/nuevo         -> crear un producto
//   /productos/5/editar      -> editar el producto con id 5
@Component({
  selector: 'app-create-product',
  imports: [RouterLink, FormsModule],
  templateUrl: './create-product.html',
})
export class CreateProduct implements OnInit {

  // Objeto que se va completando con el formulario.
  // Tiene la misma forma que espera el backend (incluida la categoria por id).
  product: Product = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    proveedor: '',
    categoria: { idCategoria: 1 },
  };

  // Lista de categorias para el desplegable (la traemos del backend).
  categorias = signal<Categoria[]>([]);

  // Si estamos editando, guardamos el id del producto. Si es null, estamos creando.
  editandoId: number | null = null;

  // Mensaje de error para la foto (por ejemplo si pesa demasiado).
  errorImagen = signal<string>('');

  // Tamano maximo permitido para la foto (en bytes). 2 MB.
  private readonly MAX_IMAGEN_BYTES = 2 * 1024 * 1024;

  constructor(
    private productService: ProductService,
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Cargamos las categorias para el desplegable.
    this.categoriaService.listar().subscribe(cats => this.categorias.set(cats));

    // Miramos si la URL trae un id (modo edicion).
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editandoId = Number(id);
      // Traemos el producto del backend y llenamos el formulario con sus datos.
      this.productService.obtener(this.editandoId).subscribe(p => {
        this.product = p;
      });
    }
  }

  // true si estamos editando (sirve para cambiar textos en la pantalla).
  get esEdicion(): boolean {
    return this.editandoId !== null;
  }

  // Se llama cuando el usuario elige un archivo de imagen.
  // Lee la foto y la guarda como texto base64 dentro de product.imagen.
  onImagenSeleccionada(evento: Event): void {
    this.errorImagen.set('');

    // El input nos da una lista de archivos; tomamos el primero.
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) {
      return;
    }

    // Validamos que sea una imagen.
    if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen (jpg, png, etc.).');
      input.value = '';
      return;
    }

    // Validamos que no pese demasiado.
    if (archivo.size > this.MAX_IMAGEN_BYTES) {
      this.errorImagen.set('La imagen es muy pesada. Maximo 2 MB.');
      input.value = '';
      return;
    }

    // FileReader convierte el archivo a un "data URL" en base64.
    // Cuando termina de leer, guardamos ese texto en el producto.
    const lector = new FileReader();
    lector.onload = () => {
      this.product.imagen = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  }

  // Para que no se puedan colocar caracteres raros en los inputs de numeros
  bloquearCaracteresInvalidos(event: KeyboardEvent): void {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
}

  // Saca la foto cargada (vuelve a dejar el producto sin imagen).
  quitarImagen(): void {
    this.product.imagen = undefined;
    this.errorImagen.set('');
  }

  // Se llama al enviar el formulario.
  // Si estamos editando, manda PUT; si no, manda POST. Despues vuelve a la lista.
  guardarProducto(f: NgForm): void {
    if (f.invalid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }
    const peticion = this.esEdicion
      ? this.productService.actualizar(this.editandoId!, this.product)
      : this.productService.crear(this.product);

    peticion.subscribe({
      next: () => this.router.navigate(['/admin/productos']),
      error: err => console.error('Error al guardar producto', err),
    });
  }
}
