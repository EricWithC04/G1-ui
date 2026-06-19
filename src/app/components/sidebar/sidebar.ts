import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Componente del menu lateral.
// Tiene la lista de todos los modulos del sistema; cada uno es un link
// que lleva a una ruta (URL) distinta de la aplicacion.
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  // Lista de links del menu.
  //   path  = la ruta (URL) a la que lleva (todas cuelgan de /admin).
  //   label = el texto que ve el usuario.
  // El template recorre esta lista y dibuja un link por cada elemento.
  links = [
    { path: 'admin', label: 'Inicio' },
    { path: 'admin/productos', label: 'Productos' },
    { path: 'admin/categorias', label: 'Categorias' },
    { path: 'admin/usuarios', label: 'Usuarios' },
    { path: 'admin/perfiles', label: 'Perfiles de cliente' },
    { path: 'admin/pedidos', label: 'Pedidos' },
    { path: 'admin/pagos', label: 'Pagos' },
    { path: 'admin/planes', label: 'Planes de cuotas' },
    { path: 'admin/envios', label: 'Envios' },
  ];
}
