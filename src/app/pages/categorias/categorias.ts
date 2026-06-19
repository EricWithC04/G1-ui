import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../models/models';

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

  constructor(private service: CategoriaService) {}

  ngOnInit(): void {
    this.cargar();
  }

  // Trae la lista completa de categorias.
  cargar(): void {
    this.service.listar().subscribe(data => this.items.set(data));
  }

  // Crea la categoria con los datos del formulario y recarga la lista.
  guardar(): void {
    this.service.crear(this.form).subscribe({
      next: () => {
        this.form = { nombre: '', descripcion: '' }; // limpiamos el formulario
        this.cargar();
      },
      error: err => console.error('Error al crear categoria', err),
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
}
