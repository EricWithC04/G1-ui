import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Componente reutilizable `admin-search`: UI compartida entre varias pantallas.
 */
@Component({
  selector: 'app-admin-search',
  imports: [FormsModule],
  templateUrl: './admin-search.html',
})
export class AdminSearch {
  termino = model('');
  placeholder = input('Buscar…');
  total = input(0);
  filtrados = input(0);
  mostrarContador = input(true);
}
