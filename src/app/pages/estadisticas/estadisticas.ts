import { Component, OnInit, ViewChild, ElementRef, computed, signal, effect } from '@angular/core';
// import { RouterLink } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { ProductService } from '../../services/product';
import { UsuarioService } from '../../services/usuario.service';
import { PedidoService } from '../../services/pedido.service';
import { Product, Usuario, Pedido } from '../../models/models';

// Como se ve cada "porcion" del grafico de pedidos por estado.
// interface EstadoPedidoStat {
//   estado: string;
//   cantidad: number;
//   porcentaje: number;
//   color: string;       // color hex, usado en el conic-gradient del donut
//   badgeClass: string;  // clases de Tailwind para el punto/etiqueta de la leyenda
// }

// // Colores fijos para los estados de pedido mas comunes. Si aparece un
// // estado que no esta en este mapa, se usa el color "default" (gris).
// const COLORES_ESTADO: Record<string, { hex: string; badgeClass: string }> = {
//   PAGADO: { hex: '#3b82f6', badgeClass: 'bg-blue-500' },
//   PENDIENTE: { hex: '#eab308', badgeClass: 'bg-yellow-500' },
//   ENVIADO: { hex: '#8b5cf6', badgeClass: 'bg-violet-500' },
//   ENTREGADO: { hex: '#22c55e', badgeClass: 'bg-green-500' },
//   CANCELADO: { hex: '#ef4444', badgeClass: 'bg-red-500' },
// };
// const COLOR_DEFAULT = { hex: '#6b7280', badgeClass: 'bg-gray-500' };

// // Pagina de inicio (dashboard).
// // Ademas de los numeros rapidos y los accesos a cada modulo, muestra
// // estadisticas con graficos: pedidos por estado (donut), los productos
// // con precio mas alto (barras) y los ultimos pedidos cargados.
// //
// // Todos los datos salen de los mismos listar() que ya se usaban antes
// // (ProductService, UsuarioService, PedidoService); no hay datos de prueba,
// // las estadisticas se calculan en el front a partir de esas listas.
// @Component({
//   selector: 'app-dashboard',
//   imports: [/* RouterLink,  */DecimalPipe, NgClass],
//   templateUrl: './estadisticas.html',
// })
// export class Estadisticas implements OnInit {

//   // @ViewChild('ventasChart') canvasRef!: ElementRef<HTMLCanvasElement>;
//   @ViewChild('lineasChart') lineasRef!: ElementRef<HTMLCanvasElement>;
//   @ViewChild('tortaChart') tortaRef!: ElementRef<HTMLCanvasElement>;

//   private lineasChart!: Chart

//   // Listas crudas que traemos del backend.
//   private productosLista = signal<Product[]>([]);
//   private usuariosLista = signal<Usuario[]>([]);
//   private pedidosLista = signal<Pedido[]>([]);

//   // True mientras todavia no llego ninguna respuesta del backend.
//   cargando = signal(true);

//   ventasPorMes = computed(() => {

//     const lista = this.pedidosLista()
//     const ventas = Array(12).fill(0);

//     lista.forEach(pedido => {
//       const mes = new Date(pedido.fecha!).getMonth();
//       ventas[mes]++;
//     });
    
//     return ventas;

//   });

//   // signals derivados: las "cajas" que antes eran signal(0) ahora se
//   // calculan solas en base a las listas de arriba.
//   productos = computed(() => this.productosLista().length);
//   usuarios = computed(() => this.usuariosLista().length);
//   pedidos = computed(() => this.pedidosLista().length);

//   // Suma de todos los pedidos (facturacion total) y el ticket promedio.
//   facturacionTotal = computed(() =>
//     this.pedidosLista().reduce((acc, p) => acc + Number(p.total ?? 0), 0)
//   );
//   ticketPromedio = computed(() =>
//     this.pedidos() > 0 ? this.facturacionTotal() / this.pedidos() : 0
//   );

//   // --- Grafico: pedidos agrupados por estado (para el donut) ---
//   pedidosPorEstado = computed<EstadoPedidoStat[]>(() => {
//     const total = this.pedidosLista().length;
//     if (total === 0) return [];

//     // Contamos cuantos pedidos hay de cada estado.
//     const conteos = new Map<string, number>();
//     for (const p of this.pedidosLista()) {
//       const estado = p.estado ?? 'SIN_ESTADO';
//       conteos.set(estado, (conteos.get(estado) ?? 0) + 1);
//     }

//     return Array.from(conteos.entries()).map(([estado, cantidad]) => {
//       const color = COLORES_ESTADO[estado] ?? COLOR_DEFAULT;
//       return {
//         estado,
//         cantidad,
//         porcentaje: Math.round((cantidad / total) * 100),
//         color: color.hex,
//         badgeClass: color.badgeClass,
//       };
//     });
//   });

//   // Arma el "conic-gradient" del donut a partir de los porcentajes de arriba.
//   // Ej: "#3b82f6 0% 40%, #eab308 40% 70%, #22c55e 70% 100%"
//   donutGradient = computed(() => {
//     const stats = this.pedidosPorEstado();
//     if (stats.length === 0) return '#374151 0% 100%'; // gris vacio si no hay pedidos

//     let acumulado = 0;
//     const tramos = stats.map(s => {
//       const desde = acumulado;
//       acumulado += s.porcentaje;
//       return `${s.color} ${desde}% ${acumulado}%`;
//     });
//     return tramos.join(', ');
//   });

//   // --- Grafico: top 5 productos con el precio mas alto (para las barras) ---
//   topProductos = computed(() =>
//     [...this.productosLista()]
//       .sort((a, b) => Number(b.precio) - Number(a.precio))
//       .slice(0, 5)
//   );

//   // El precio mas alto entre los productos de arriba, para calcular el
//   // ancho (%) de cada barra en relacion a el.
//   maxPrecioTop = computed(() =>
//     Math.max(...this.topProductos().map(p => Number(p.precio)), 1)
//   );

//   // --- Ultimos 5 pedidos cargados (los de mayor id = mas recientes) ---
//   pedidosRecientes = computed(() =>
//     [...this.pedidosLista()]
//       .sort((a, b) => (b.idPedido ?? 0) - (a.idPedido ?? 0))
//       .slice(0, 5)
//   );

//   // Tarjetas de acceso rapido a los modulos (todas dentro de /admin).
//   accesos = [
//     { path: 'admin/productos', titulo: 'Productos', desc: 'Administra el catalogo' },
//     { path: 'admin/categorias', titulo: 'Categorias', desc: 'Organiza los productos' },
//     { path: 'admin/usuarios', titulo: 'Usuarios', desc: 'Clientes y administradores' },
//     { path: 'admin/pedidos', titulo: 'Pedidos', desc: 'Compras de los clientes' },
//     { path: 'admin/pagos', titulo: 'Pagos', desc: 'Cobros de los pedidos' },
//     { path: 'admin/envios', titulo: 'Envios', desc: 'Seguimiento de entregas' },
//   ];

//   // Angular nos pasa los servicios que pedimos en el constructor (inyeccion de dependencias).
//   constructor(
//     private productService: ProductService,
//     private usuarioService: UsuarioService,
//     private pedidoService: PedidoService,
//   ) {
//     effect(() => {
//       const ventas = this.ventasPorMes()
//       if (!this.lineasChart) return;
//       this.lineasChart.data.datasets[0].data = ventas;
//       this.lineasChart.update();
//     })
//   }

//   // ngOnInit se ejecuta una vez cuando la pagina se carga.
//   // Pedimos cada lista completa: los conteos y los graficos salen de ahi.
//   ngOnInit(): void {
//     let pendientes = 3;
//     const unaLlamadaMenos = () => {
//       pendientes -= 1;
//       if (pendientes === 0) this.cargando.set(false);
//     };
    
//     this.productService.listar().subscribe(items => {
//       this.productosLista.set(items);
//       unaLlamadaMenos();
//     });
//     this.usuarioService.listar().subscribe(items => {
//       this.usuariosLista.set(items);
//       unaLlamadaMenos();
//     });
//     this.pedidoService.listar().subscribe(items => {
//       this.pedidosLista.set(items);
//       unaLlamadaMenos();
//     });
//   }

//   ngAfterViewInit() {
//     const mesesLabels = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    
//     this.lineasChart = new Chart(this.lineasRef.nativeElement, {
//       type: 'line',
//       data: { labels: mesesLabels, datasets: [{ label: "Ventas por mes", data: this.ventasPorMes() /* [211, 243, 101, 314, 298, 344, 416] */ }] },
//       options: { responsive: true, maintainAspectRatio: true },
//     });

//     new Chart(this.tortaRef.nativeElement, {
//       type: 'pie',
//       data: { labels: ["Perifericos", "Notebooks", "Celulares"], datasets: [{ data: [1107, 403, 671] }] },
//       options: { responsive: false, maintainAspectRatio: true }
//     });
//   }

//   // Color de la "badge" de un estado de pedido, para reusar en la tabla
//   // de pedidos recientes (mismo criterio que en el donut).
//   badgeClasePorEstado(estado: string | undefined): string {
//     return COLORES_ESTADO[estado ?? '']?.badgeClass ?? COLOR_DEFAULT.badgeClass;
//   }
// }