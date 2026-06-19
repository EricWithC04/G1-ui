import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { UsuarioService } from '../../services/usuario.service';
import { PedidoService } from '../../services/pedido.service';

// Pagina de inicio (dashboard).
// Muestra unos numeros rapidos (cuantos productos, usuarios, etc.) y
// tarjetas con accesos directos a cada modulo.
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {

  // signals: "cajas" reactivas con los conteos. Cuando cambian, la vista se actualiza sola.
  productos = signal(0);
  usuarios = signal(0);
  pedidos = signal(0);

  // Tarjetas de acceso rapido a los modulos (todas dentro de /admin).
  accesos = [
    { path: 'admin/productos', titulo: 'Productos', desc: 'Administra el catalogo' },
    { path: 'admin/categorias', titulo: 'Categorias', desc: 'Organiza los productos' },
    { path: 'admin/usuarios', titulo: 'Usuarios', desc: 'Clientes y administradores' },
    { path: 'admin/pedidos', titulo: 'Pedidos', desc: 'Compras de los clientes' },
    { path: 'admin/pagos', titulo: 'Pagos', desc: 'Cobros de los pedidos' },
    { path: 'admin/envios', titulo: 'Envios', desc: 'Seguimiento de entregas' },
  ];

  // Angular nos pasa los servicios que pedimos en el constructor (inyeccion de dependencias).
  constructor(
    private productService: ProductService,
    private usuarioService: UsuarioService,
    private pedidoService: PedidoService,
  ) {}

  // ngOnInit se ejecuta una vez cuando la pagina se carga.
  // Pedimos cada lista y guardamos solo su cantidad (length).
  ngOnInit(): void {
    this.productService.listar().subscribe(items => this.productos.set(items.length));
    this.usuarioService.listar().subscribe(items => this.usuarios.set(items.length));
    this.pedidoService.listar().subscribe(items => this.pedidos.set(items.length));
  }
}
