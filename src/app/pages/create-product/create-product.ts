import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { CategoriaService } from '../../services/categoria.service';
import { Product, Categoria } from '../../models/models';
import { aEntero, esEnteroNoNegativo, mensajeEntero } from '../../utils/validadores-admin';

@Component({
  selector: 'app-create-product',
  imports: [RouterLink, FormsModule],
  templateUrl: './create-product.html',
})
export class CreateProduct implements OnInit {

  product: Product = this.productoVacio();
  categorias = signal<Categoria[]>([]);
  editandoId: number | null = null;
  cargandoProducto = signal(false);
  errorImagen = signal<string>('');
  errorGuardado = signal('');

  private readonly MAX_IMAGEN_BYTES = 2 * 1024 * 1024;

  constructor(
    private productService: ProductService,
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.categoriaService.listar().subscribe(cats => this.categorias.set(cats));

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editandoId = Number(id);
        this.cargarProducto(this.editandoId);
      } else {
        this.editandoId = null;
        this.product = this.productoVacio();
      }
    });
  }

  private productoVacio(): Product {
    return {
      nombre: '',
      descripcion: '',
      precio: 0,
      precioLista: 0,
      stock: 0,
      stockMinimo: 5,
      proveedor: '',
      categoria: { idCategoria: 1 },
    };
  }

  private cargarProducto(id: number): void {
    this.cargandoProducto.set(true);
    this.errorGuardado.set('');
    this.productService.obtener(id).subscribe({
      next: p => {
        const idCat = p.categoria?.idCategoria ?? this.categorias()[0]?.idCategoria ?? 1;
        this.product = {
          ...p,
          categoria: { idCategoria: idCat },
        };
        this.cargandoProducto.set(false);
      },
      error: () => {
        this.cargandoProducto.set(false);
        this.errorGuardado.set('No se pudo cargar el producto.');
        this.router.navigate(['/admin/productos']);
      },
    });
  }

  get esEdicion(): boolean {
    return this.editandoId !== null;
  }

  onImagenSeleccionada(evento: Event): void {
    this.errorImagen.set('');
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen (jpg, png, etc.).');
      input.value = '';
      return;
    }

    if (archivo.size > this.MAX_IMAGEN_BYTES) {
      this.errorImagen.set('La imagen es muy pesada. Maximo 2 MB.');
      input.value = '';
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      this.product.imagen = lector.result as string;
    };
    lector.readAsDataURL(archivo);
  }

  bloquearCaracteresInvalidos(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-'].includes(event.key)) {
      event.preventDefault();
    }
  }

  bloquearDecimalesStock(event: KeyboardEvent): void {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
      event.preventDefault();
    }
  }

  quitarImagen(): void {
    this.product.imagen = undefined;
    this.errorImagen.set('');
  }

  guardarProducto(f: NgForm): void {
    if (f.invalid) {
      Object.values(f.controls).forEach(c => c.markAsTouched());
      return;
    }
    if (!esEnteroNoNegativo(this.product.stock)) {
      this.errorGuardado.set(mensajeEntero('Stock'));
      return;
    }
    if (this.product.stockMinimo != null && !esEnteroNoNegativo(this.product.stockMinimo)) {
      this.errorGuardado.set(mensajeEntero('Stock mínimo'));
      return;
    }
    this.errorGuardado.set('');
    this.product.stock = aEntero(this.product.stock);
    this.product.stockMinimo = aEntero(this.product.stockMinimo ?? 0);

    const peticion = this.esEdicion
      ? this.productService.actualizar(this.editandoId!, this.product)
      : this.productService.crear(this.product);

    peticion.subscribe({
      next: () => this.router.navigate(['/admin/productos']),
      error: err => this.errorGuardado.set(err.error?.message ?? 'Error al guardar producto'),
    });
  }
}
