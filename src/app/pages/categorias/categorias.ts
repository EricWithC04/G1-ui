import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/models';
import { validarNombreCategoria } from '../../utils/categoria-nombre';

// Pagina del modulo de Categorias.
// Muestra la lista y tiene un formulario simple para crear una nueva.
@Component({
  selector: 'app-categorias',
  imports: [FormsModule],
  templateUrl: './categorias.html',
})
export class Categorias implements OnInit {

  // Lista de categorias que viene del backend.
  items = signal<Categoria[]>([]);

  // Objeto del formulario para crear una categoria nueva.
  form: Categoria = { nombre: '', descripcion: '' };

  // Mensaje de error visible si el formulario viene vacio o el backend rechaza los datos.
  error = signal<string | null>(null);

  // true mientras esperamos la respuesta del backend.
  guardando = signal(false);

  // Nombre del formulario sin espacios al inicio/fin (para validar en el HTML).
  get nombreLimpio(): string {
    return (this.form.nombre ?? '').trim();
  }

  constructor(private service: CategoriaService) {}

  ngOnInit(): void {
    this.cargar();
  }

  // Trae la lista completa de categorias.
  cargar(): void {
    this.service.listar().subscribe(data => this.items.set(data));
  }

  // Crea la categoria con los datos del formulario y recarga la lista.
  guardar(formulario: NgForm): void {
    const nombre = this.form.nombre?.trim() ?? '';
    const descripcion = this.form.descripcion?.trim() ?? '';

    // Validamos aca tambien (no solo con HTML) para bloquear espacios en blanco y nombres basura.
    if (!nombre) {
      this.error.set('El nombre de la categoria es obligatorio.');
      formulario.controls['nombre']?.setErrors({ required: true });
      return;
    }
    const errorNombre = validarNombreCategoria(nombre);
    if (errorNombre) {
      this.error.set(errorNombre);
      formulario.controls['nombre']?.setErrors({ pattern: true });
      return;
    }
    if (descripcion && descripcion.length > 0 && (descripcion.length < 3 || /[{}[\];]/.test(descripcion))) {
      this.error.set('La descripcion es muy corta o tiene caracteres no permitidos.');
      return;
    }

    this.error.set(null);
    this.guardando.set(true);

    const datos: Categoria = { nombre, descripcion: descripcion || undefined };

    this.service.crear(datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.form = { nombre: '', descripcion: '' };
        formulario.resetForm({ nombre: '', descripcion: '' });
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        const body = err.error;
        const msg = body?.fields?.nombre
          ?? body?.message
          ?? (typeof body === 'string' ? body : null)
          ?? 'No se pudo crear la categoria. Revisa los datos.';
        this.error.set(msg);
        console.error('Error al crear categoria', err);
      },
    });
  }

  // Borra una categoria por su id y recarga la lista.
  borrar(id?: number): void {
    if (id == null) return;
    this.service.eliminar(id).subscribe({
      next: () => this.cargar(),
      error: err => console.error('Error al borrar categoria', err),
    });
  }

  // Expuesto al template para validar el nombre con la misma regla del backend.
  nombreValido(nombre: string): boolean {
    return validarNombreCategoria(nombre) === null;
  }
}
