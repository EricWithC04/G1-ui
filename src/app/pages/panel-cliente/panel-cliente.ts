import {
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { AuthService, UsuarioSesion } from '../../services/auth.service';
import { ClientePortalService } from '../../services/cliente-portal.service';
import { CartService } from '../../services/cart.service';
import {
  esEmailValido,
  esTelefonoValido,
  mensajeEmail,
  mensajeTelefono,
} from '../../utils/validadores-form';
import {
  Conversacion,
  CuotaClienteItem,
  Envio,
  Factura,
  MensajeConversacion,
  Pedido,
  PedidoDetalleResponse,
  PerfilCliente,
  PrestamoCliente,
  SolicitudDevolucion,
} from '../../models/models';

type SeccionPanel =
  | 'perfil'
  | 'pedidos'
  | 'direcciones'
  | 'facturas'
  | 'soporte'
  | 'devoluciones'
  | 'cuotas'
  | 'ayuda'
  | 'seguridad';

type FiltroPedidos = 'todos' | 'activos' | 'entregados' | 'cancelados';

/**
 * Página `panel-cliente`: pantalla Angular (componente + template) del módulo panel-cliente.
 */
@Component({
  selector: 'app-panel-cliente',
  imports: [FormsModule, DecimalPipe, DatePipe, NgClass, RouterLink],
  templateUrl: './panel-cliente.html',
  styleUrl: './panel-cliente.css',
})
export class PanelCliente implements OnInit {
  seccionActiva = signal<SeccionPanel>('perfil');
  filtroPedidos = signal<FiltroPedidos>('todos');

  usuario = signal<UsuarioSesion | null>(null);
  perfilCliente = signal<PerfilCliente | null>(null);
  pedidos = signal<Pedido[]>([]);
  detallesPorPedido = signal<Map<number, PedidoDetalleResponse>>(new Map());
  facturas = signal<Factura[]>([]);
  tickets = signal<Conversacion[]>([]);
  devoluciones = signal<SolicitudDevolucion[]>([]);
  prestamos = signal<PrestamoCliente[]>([]);

  cargando = signal(true);
  error = signal<string | null>(null);
  guardando = signal(false);

  pedidoDetalle = signal<Pedido | null>(null);
  ticketDetalle = signal<Conversacion | null>(null);
  mensajesTicket = signal<MensajeConversacion[]>([]);
  devolucionDetalle = signal<SolicitudDevolucion | null>(null);

  crearTicketVisible = signal(false);
  ticketTipo = signal('consulta');
  ticketAsunto = signal('');
  ticketCuerpo = signal('');
  ticketIdPedido = signal<number | null>(null);
  ticketRespuesta = signal('');

  crearDevolucionVisible = signal(false);
  devolucionIdPedido = signal<number | null>(null);
  devolucionMotivo = signal('DEFECTO');
  devolucionDescripcion = signal('');

  perfilEditando = signal(false);
  perfilNombre = signal('');
  perfilEmail = signal('');
  perfilTelefono = signal('');

  direccionEditando = signal(false);
  direccionCalle = signal('');
  direccionCiudad = signal('');

  passActual = signal('');
  passNueva = signal('');
  passConfirmar = signal('');
  passError = signal<string | null>(null);
  passExito = signal(false);

  filtrosPedido: { id: FiltroPedidos; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'activos', label: 'En curso' },
    { id: 'entregados', label: 'Entregados' },
    { id: 'cancelados', label: 'Cancelados' },
  ];

  secciones: { id: SeccionPanel; label: string; icon: string }[] = [
    { id: 'perfil',       label: 'Perfil',       icon: '👤' },
    { id: 'pedidos',      label: 'Pedidos',       icon: '📦' },
    { id: 'facturas',     label: 'Facturas',      icon: '🧾' },
    { id: 'soporte',      label: 'Soporte',       icon: '💬' },
    { id: 'devoluciones', label: 'Devoluciones',  icon: '↩️' },
    { id: 'cuotas',       label: 'Préstamos',     icon: '💳' },
    { id: 'direcciones',  label: 'Direcciones',   icon: '📍' },
    { id: 'ayuda',        label: 'Ayuda',         icon: '❓' },
    { id: 'seguridad',    label: 'Seguridad',     icon: '🔒' },
  ];

  faqs = [
    { q: '¿Cómo sigo mi pedido?', a: 'Entrá a Pedidos, abrí el detalle y tocá "Ver seguimiento". También podés ver el estado en la lista.' },
    { q: '¿Cómo solicito una devolución?', a: 'En Pedidos o Devoluciones, elegí un pedido entregado/enviado y completá el formulario. Te avisamos cuando cambie el estado.' },
    { q: '¿Cómo contacto a soporte?', a: 'En Soporte podés crear un ticket. Si está vinculado a un pedido, incluí el número para agilizar la respuesta.' },
    { q: '¿Dónde veo mis facturas?', a: 'En la sección Facturas aparecen los comprobantes de tus compras emitidas.' },
    { q: '¿Puedo financiar en cuotas?', a: 'Si tu compra tiene plan de cuotas, lo verás en la sección Cuotas con vencimientos y estado de cada una.' },
  ];

  tiposTicket = [
    { id: 'consulta', label: 'Consulta general', etiqueta: 'consulta' },
    { id: 'soporte', label: 'Soporte técnico', etiqueta: 'soporte' },
    { id: 'reclamo', label: 'Reclamo', etiqueta: 'reclamo' },
    { id: 'devolucion', label: 'Devolución', etiqueta: 'devolucion' },
  ];

  motivosDevolucion = [
    { id: 'DEFECTO', label: 'Producto defectuoso' },
    { id: 'ARREPENTIMIENTO', label: 'Arrepentimiento de compra' },
    { id: 'ENVIO_INCORRECTO', label: 'Envío incorrecto' },
    { id: 'OTRO', label: 'Otro motivo' },
  ];

  pedidosOrdenados = computed(() => this.ordenarPorFecha(this.pedidos()));

  pedidosFiltrados = computed(() => {
    const filtro = this.filtroPedidos();
    return this.pedidosOrdenados().filter(p => {
      const estado = (p.estado ?? '').toUpperCase();
      const envioEstado = this.envioDePedido(p.idPedido)?.estadoEnvio?.toUpperCase().replace(/ /g, '_');
      const entregado = estado === 'ENTREGADO' || envioEstado === 'ENTREGADO';
      const cancelado = estado === 'CANCELADO';
      switch (filtro) {
        case 'activos':
          return !cancelado && !entregado;
        case 'entregados':
          return entregado && !cancelado;
        case 'cancelados':
          return cancelado;
        default:
          return true;
      }
    });
  });

  pedidosActivos = computed(() =>
    this.pedidosOrdenados().filter(p => {
      const estado = (p.estado ?? '').toUpperCase();
      const envioEstado = this.envioDePedido(p.idPedido)?.estadoEnvio?.toUpperCase();
      return estado !== 'CANCELADO' && estado !== 'ENTREGADO' && envioEstado !== 'ENTREGADO';
    }),
  );

  ticketsAbiertos = computed(() =>
    this.tickets().filter(t => {
      const e = (t.estado ?? '').toUpperCase();
      return e === 'PENDIENTE' || e === 'EN_PROCESO';
    }).length,
  );

  pedidosElegiblesDevolucion = computed(() =>
    this.pedidosOrdenados().filter(p => this.pedidoPuedeDevolverse(p)),
  );

  cuotasPendientes = computed(() =>
    this.prestamos().reduce((sum, p) => {
      const pendientes = (p.cuotas ?? []).filter(c => {
        const e = (c.estado ?? '').toUpperCase();
        return e === 'PENDIENTE' || e === 'VENCIDA';
      }).length;
      return sum + pendientes;
    }, 0),
  );

  tieneDireccion = computed(() => {
    const p = this.perfilCliente();
    return !!(p?.direccion?.trim() || p?.ciudad?.trim());
  });

  puedeCambiarPass = computed(() =>
    !!this.passActual() && !!this.passNueva() && this.passNueva().length >= 8 && !this.guardando(),
  );

  constructor(
    private authService: AuthService,
    private clientePortal: ClientePortalService,
    private cart: CartService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const seccionData = this.route.snapshot.data['seccion'] as SeccionPanel | undefined;
    if (seccionData && this.secciones.some(s => s.id === seccionData)) {
      this.seccionActiva.set(seccionData);
    }

    this.route.queryParamMap.subscribe(params => {
      const seccion = params.get('seccion') as SeccionPanel | null;
      if (seccion && this.secciones.some(s => s.id === seccion)) {
        this.seccionActiva.set(seccion);
      }
    });

    this.cargarDatos();
  }

  private ordenarPorFecha(pedidos: Pedido[]): Pedido[] {
    return [...pedidos].sort((a, b) => {
      const fa = a.fecha ? new Date(a.fecha).getTime() : 0;
      const fb = b.fecha ? new Date(b.fecha).getTime() : 0;
      if (fb !== fa) return fb - fa;
      return (b.idPedido ?? 0) - (a.idPedido ?? 0);
    });
  }

  private cargarDatos(): void {
    const sesion = this.authService.getUsuario();
    if (!sesion) {
      this.cargando.set(false);
      this.error.set('Debés iniciar sesión para ver tu cuenta.');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.usuario.set(sesion);
    this.perfilNombre.set(sesion.nombre);
    this.perfilEmail.set(sesion.email);

    forkJoin({
      pedidos: this.clientePortal.listarPedidos().pipe(catchError(() => of([] as Pedido[]))),
      facturas: this.clientePortal.listarFacturas().pipe(catchError(() => of([] as Factura[]))),
      perfil: this.clientePortal.obtenerPerfil().pipe(catchError(() => of(null))),
      tickets: this.clientePortal.listarTickets().pipe(catchError(() => of([] as Conversacion[]))),
      devoluciones: this.clientePortal.listarDevoluciones().pipe(catchError(() => of([] as SolicitudDevolucion[]))),
      cuotas: this.clientePortal.listarPrestamos().pipe(catchError(() => of([] as PrestamoCliente[]))),
    }).subscribe({
      next: ({ pedidos, facturas, perfil, tickets, devoluciones, cuotas }) => {
        this.pedidos.set(pedidos);
        this.facturas.set(facturas);
        this.tickets.set(tickets);
        this.devoluciones.set(devoluciones);
        this.prestamos.set(cuotas);
        this.perfilCliente.set(perfil);
        this.perfilTelefono.set(perfil?.telefono ?? '');
        this.direccionCalle.set(perfil?.direccion ?? '');
        this.direccionCiudad.set(perfil?.ciudad ?? '');
        this.cargando.set(false);
        this.cargarDetallesPedidos(pedidos);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos de tu cuenta.');
        this.cargando.set(false);
      },
    });
  }

  private cargarDetallesPedidos(pedidos: Pedido[]): void {
    const ids = pedidos.filter(p => p.idPedido != null).map(p => p.idPedido!);
    if (ids.length === 0) return;

    forkJoin(ids.map(id => this.clientePortal.obtenerPedido(id))).subscribe({
      next: detalles => {
        const map = new Map<number, PedidoDetalleResponse>();
        detalles.forEach(d => {
          if (d.pedido.idPedido != null) {
            map.set(d.pedido.idPedido, d);
          }
        });
        this.detallesPorPedido.set(map);
      },
    });
  }

  setFiltroPedidos(filtro: FiltroPedidos): void {
    this.filtroPedidos.set(filtro);
    this.pedidoDetalle.set(null);
  }

  irA(seccion: SeccionPanel): void {
    this.seccionActiva.set(seccion);
    this.pedidoDetalle.set(null);
    this.ticketDetalle.set(null);
    this.mensajesTicket.set([]);
    this.devolucionDetalle.set(null);
    this.crearTicketVisible.set(false);
    this.crearDevolucionVisible.set(false);
    this.perfilEditando.set(false);
    this.direccionEditando.set(false);
    this.passError.set(null);
    this.passExito.set(false);
  }

  iniciarEdicionPerfil(): void {
    const u = this.usuario();
    if (!u) return;
    this.perfilNombre.set(u.nombre);
    this.perfilEmail.set(u.email);
    this.perfilTelefono.set(this.perfilCliente()?.telefono ?? '');
    this.perfilEditando.set(true);
  }

  cancelarEdicionPerfil(): void {
    this.perfilEditando.set(false);
  }

  guardarPerfil(): void {
    if (!this.perfilNombre().trim()) {
      this.toast.error('El nombre no puede estar vacío.');
      return;
    }
    if (!esEmailValido(this.perfilEmail())) {
      this.toast.error(mensajeEmail());
      return;
    }
    const tel = this.perfilTelefono().trim();
    if (tel && !esTelefonoValido(tel)) {
      this.toast.error(mensajeTelefono());
      return;
    }

    this.guardando.set(true);
    this.clientePortal.actualizarPerfil({
      nombre: this.perfilNombre().trim(),
      email: this.perfilEmail().trim(),
      telefono: this.perfilTelefono().trim() || undefined,
    }).subscribe({
      next: p => {
        this.perfilCliente.set(p);
        this.perfilEditando.set(false);
        this.guardando.set(false);
        void this.authService.restaurarSesion().then(() => {
          this.usuario.set(this.authService.getUsuario());
        });
        this.toast.exito('Perfil actualizado correctamente.');
      },
      error: () => {
        this.guardando.set(false);
        this.toast.error('No se pudo guardar el perfil.');
      },
    });
  }

  verDetallePedido(p: Pedido): void {
    this.pedidoDetalle.set(p);
    if (p.idPedido != null && !this.detallesPorPedido().has(p.idPedido)) {
      this.clientePortal.obtenerPedido(p.idPedido).subscribe({
        next: d => {
          const map = new Map(this.detallesPorPedido());
          map.set(p.idPedido!, d);
          this.detallesPorPedido.set(map);
        },
      });
    }
  }

  cerrarDetalle(): void {
    this.pedidoDetalle.set(null);
  }

  detalleDePedido(idPedido: number | undefined): PedidoDetalleResponse | undefined {
    if (idPedido == null) return undefined;
    return this.detallesPorPedido().get(idPedido);
  }

  envioDePedido(idPedido: number | undefined): Envio | undefined {
    return this.detalleDePedido(idPedido)?.envio;
  }

  cantidadProductos(idPedido: number | undefined): number {
    return this.detalleDePedido(idPedido)?.detalles?.length ?? 0;
  }

  metodoPagoPedido(idPedido: number | undefined): string {
    const pagos = this.detalleDePedido(idPedido)?.pagos;
    return pagos?.[0]?.metodo ?? '—';
  }

  estadoPedido(pedido: Pedido): string {
    const envio = this.envioDePedido(pedido.idPedido);
    if (envio?.estadoEnvio) {
      return envio.estadoEnvio.replace(/_/g, ' ');
    }
    return pedido.estado ?? 'PENDIENTE';
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      PAGADO: 'Pagado',
      CONFIRMADO: 'Confirmado',
      EN_PREPARACION: 'En preparación',
      PREPARANDO: 'Preparando',
      EN_CAMINO: 'En camino',
      ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    const key = estado.toUpperCase().replace(/ /g, '_');
    return map[key] ?? estado;
  }

  estadoBadgeClass(pedido: Pedido): string {
    const estado = (this.envioDePedido(pedido.idPedido)?.estadoEnvio ?? pedido.estado ?? 'PENDIENTE')
      .toUpperCase()
      .replace(/ /g, '_');
    const map: Record<string, string> = {
      PENDIENTE:      'pc-badge--pending',
      PAGADO:         'pc-badge--confirmed',
      CONFIRMADO:     'pc-badge--confirmed',
      EN_PREPARACION: 'pc-badge--preparing',
      PREPARANDO:     'pc-badge--preparing',
      EN_CAMINO:      'pc-badge--shipping',
      ENVIADO:        'pc-badge--shipping',
      ENTREGADO:      'pc-badge--delivered',
      CANCELADO:      'pc-badge--cancelled',
    };
    return map[estado] ?? 'pc-badge--pending';
  }

  pasoTracking(pedido: Pedido): number {
    const envio = this.envioDePedido(pedido.idPedido);
    if (!envio?.estadoEnvio) {
      return pedido.estado === 'PAGADO' || pedido.estado === 'CONFIRMADO' ? 1 : 0;
    }
    const estado = envio.estadoEnvio.toUpperCase().replace(/ /g, '_');
    switch (estado) {
      case 'ENTREGADO':
        return 4;
      case 'EN_CAMINO':
      case 'ENVIADO':
        return 3;
      case 'PREPARANDO':
      case 'EN_PREPARACION':
        return 2;
      default:
        return 1;
    }
  }

  iniciarEdicionDireccion(): void {
    const p = this.perfilCliente();
    this.direccionCalle.set(p?.direccion ?? '');
    this.direccionCiudad.set(p?.ciudad ?? '');
    this.perfilTelefono.set(p?.telefono ?? this.perfilTelefono());
    this.direccionEditando.set(true);
  }

  cancelarEdicionDireccion(): void {
    this.direccionEditando.set(false);
  }

  guardarDireccion(): void {
    if (!this.direccionCalle().trim() || !this.direccionCiudad().trim()) {
      this.toast.error('Completá dirección y ciudad.');
      return;
    }
    const tel = this.perfilTelefono().trim();
    if (tel && !esTelefonoValido(tel)) {
      this.toast.error(mensajeTelefono());
      return;
    }

    const sesion = this.authService.getUsuario();
    if (!sesion) return;

    this.guardando.set(true);
    this.clientePortal.actualizarPerfil({
      direccion: this.direccionCalle().trim(),
      ciudad: this.direccionCiudad().trim(),
      telefono: this.perfilTelefono().trim() || undefined,
    }).subscribe({
      next: p => {
        this.perfilCliente.set(p);
        this.direccionEditando.set(false);
        this.guardando.set(false);
        this.toast.exito('Dirección guardada.');
      },
      error: () => {
        this.guardando.set(false);
        this.toast.error('No se pudo guardar la dirección.');
      },
    });
  }

  descargarFactura(_factura: Factura): void {
    this.toast.mostrar('La descarga de PDF estará disponible próximamente.', 'info');
  }

  pedidoPuedeDevolverse(pedido: Pedido): boolean {
    const estado = (pedido.estado ?? '').toUpperCase();
    return ['ENTREGADO', 'COMPLETADO', 'PAGADO', 'ENVIADO'].includes(estado);
  }

  whatsappPedido(pedido: Pedido): string {
    const id = pedido.idPedido ?? '';
    const msg = encodeURIComponent(`Hola! Quiero consultar sobre mi pedido #${id}`);
    return `https://wa.me/5491112345678?text=${msg}`;
  }

  recomprarPedido(pedido: Pedido): void {
    const lineas = this.detalleDePedido(pedido.idPedido)?.detalles ?? [];
    if (lineas.length === 0) {
      this.toast.error('Todavía estamos cargando los productos de este pedido.');
      if (pedido.idPedido != null) {
        this.clientePortal.obtenerPedido(pedido.idPedido).subscribe({
          next: d => {
            const map = new Map(this.detallesPorPedido());
            map.set(pedido.idPedido!, d);
            this.detallesPorPedido.set(map);
            this.recomprarPedido(pedido);
          },
        });
      }
      return;
    }

    let agregados = 0;
    for (const l of lineas) {
      if (l.producto?.idProducto != null) {
        this.cart.agregar(l.producto, l.cantidad);
        agregados++;
      }
    }

    if (agregados === 0) {
      this.toast.error('No se pudieron agregar productos al carrito.');
      return;
    }

    this.toast.exito(`${agregados} producto(s) agregados al carrito.`);
    void this.router.navigate(['/carrito']);
  }

  estadoCuotaLabel(estado?: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      PAGADA: 'Pagada',
      VENCIDA: 'Vencida',
    };
    return map[(estado ?? '').toUpperCase()] ?? estado ?? '—';
  }

  badgeEstadoCuota(estado?: string): string {
    const e = (estado ?? '').toUpperCase();
    if (e === 'PAGADA') return 'pc-badge--delivered';
    if (e === 'VENCIDA') return 'pc-badge--cancelled';
    return 'pc-badge--pending';
  }

  progresoPrestamo(p: PrestamoCliente): number {
    const total = p.cantidadCuotas ?? p.cuotas?.length ?? 0;
    if (total <= 0) return 0;
    return Math.round(((p.cuotasPagadas ?? 0) / total) * 100);
  }

  textoCuotaActual(p: PrestamoCliente): string {
    const total = p.cantidadCuotas ?? 0;
    const pagadas = p.cuotasPagadas ?? 0;
    if (p.cuotaActual == null || total === 0) {
      return pagadas >= total && total > 0 ? `Préstamo finalizado (${total} de ${total})` : 'Sin cuotas pendientes';
    }
    return `Estás en la cuota ${p.cuotaActual} de ${total}`;
  }

  esCuotaActual(p: PrestamoCliente, c: CuotaClienteItem): boolean {
    return p.cuotaActual != null && c.numeroCuota === p.cuotaActual;
  }

  esCuotaPagada(c: CuotaClienteItem): boolean {
    return (c.estado ?? '').toUpperCase() === 'PAGADA';
  }

  estadoTicketLabel(estado?: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_PROCESO: 'En proceso',
      RESUELTA: 'Resuelto',
    };
    return map[(estado ?? '').toUpperCase()] ?? estado ?? '—';
  }

  estadoDevolucionLabel(estado?: string): string {
    const map: Record<string, string> = {
      SOLICITADA: 'Solicitada',
      APROBADA: 'Aprobada',
      RECHAZADA: 'Rechazada',
      EN_TRANSITO: 'En tránsito',
      RECIBIDA: 'Recibida',
      REEMBOLSADA: 'Reembolsada',
    };
    return map[(estado ?? '').toUpperCase()] ?? estado ?? '—';
  }

  badgeEstadoTicket(estado?: string): string {
    const e = (estado ?? '').toUpperCase();
    if (e === 'RESUELTA') return 'pc-badge--delivered';
    if (e === 'EN_PROCESO') return 'pc-badge--preparing';
    return 'pc-badge--pending';
  }

  badgeEstadoDevolucion(estado?: string): string {
    const e = (estado ?? '').toUpperCase();
    if (e === 'REEMBOLSADA' || e === 'RECIBIDA') return 'pc-badge--delivered';
    if (e === 'RECHAZADA') return 'pc-badge--cancelled';
    if (e === 'APROBADA' || e === 'EN_TRANSITO') return 'pc-badge--shipping';
    return 'pc-badge--pending';
  }

  esMensajeCliente(msg: MensajeConversacion): boolean {
    return (msg.direccion ?? '').toUpperCase() === 'ENTRANTE';
  }

  iniciarCrearTicket(idPedido?: number | null): void {
    this.seccionActiva.set('soporte');
    this.ticketDetalle.set(null);
    this.crearTicketVisible.set(true);
    this.ticketTipo.set('consulta');
    this.ticketAsunto.set('');
    this.ticketCuerpo.set('');
    this.ticketIdPedido.set(idPedido ?? null);
  }

  cancelarCrearTicket(): void {
    this.crearTicketVisible.set(false);
  }

  guardarTicket(): void {
    if (!this.ticketCuerpo().trim()) {
      this.toast.error('Escribí tu consulta.');
      return;
    }
    const tipo = this.tiposTicket.find(t => t.id === this.ticketTipo());
    const asunto = this.ticketAsunto().trim()
      || `${tipo?.label ?? 'Consulta'}${this.ticketIdPedido() ? ` · Pedido #${this.ticketIdPedido()}` : ''}`;

    this.guardando.set(true);
    this.clientePortal.crearTicket({
      asunto,
      cuerpo: this.ticketCuerpo().trim(),
      etiquetas: tipo?.etiqueta,
      idPedido: this.ticketIdPedido() ?? undefined,
    }).subscribe({
      next: ticket => {
        this.tickets.update(list => [ticket, ...list]);
        this.crearTicketVisible.set(false);
        this.guardando.set(false);
        this.toast.exito('Ticket creado. Te responderemos pronto.');
        this.verTicket(ticket);
      },
      error: err => {
        this.guardando.set(false);
        const msg = err?.error?.message ?? err?.error?.mensaje;
        this.toast.error(typeof msg === 'string' ? msg : 'No se pudo crear el ticket.');
      },
    });
  }

  verTicket(ticket: Conversacion): void {
    if (ticket.idConversacion == null) return;
    this.ticketDetalle.set(ticket);
    this.crearTicketVisible.set(false);
    this.clientePortal.listarMensajesTicket(ticket.idConversacion).subscribe({
      next: msgs => this.mensajesTicket.set(msgs),
      error: () => this.toast.error('No se pudieron cargar los mensajes.'),
    });
  }

  cerrarTicket(): void {
    this.ticketDetalle.set(null);
    this.mensajesTicket.set([]);
    this.ticketRespuesta.set('');
  }

  enviarMensajeTicket(): void {
    const ticket = this.ticketDetalle();
    const cuerpo = this.ticketRespuesta().trim();
    if (!ticket?.idConversacion || !cuerpo) return;

    this.guardando.set(true);
    this.clientePortal.responderTicket(ticket.idConversacion, cuerpo).subscribe({
      next: msg => {
        this.mensajesTicket.update(list => [...list, msg]);
        this.ticketRespuesta.set('');
        this.guardando.set(false);
        this.tickets.update(list =>
          list.map(t => t.idConversacion === ticket.idConversacion
            ? { ...t, vistaPrevia: cuerpo.slice(0, 120), estado: t.estado === 'RESUELTA' ? 'PENDIENTE' : t.estado }
            : t),
        );
      },
      error: () => {
        this.guardando.set(false);
        this.toast.error('No se pudo enviar el mensaje.');
      },
    });
  }

  iniciarCrearDevolucion(idPedido?: number | null): void {
    this.seccionActiva.set('devoluciones');
    this.devolucionDetalle.set(null);
    this.crearDevolucionVisible.set(true);
    this.devolucionIdPedido.set(idPedido ?? this.pedidosElegiblesDevolucion()[0]?.idPedido ?? null);
    this.devolucionMotivo.set('DEFECTO');
    this.devolucionDescripcion.set('');
  }

  cancelarCrearDevolucion(): void {
    this.crearDevolucionVisible.set(false);
  }

  guardarDevolucion(): void {
    const idPedido = this.devolucionIdPedido();
    if (idPedido == null) {
      this.toast.error('Seleccioná un pedido.');
      return;
    }
    if (!this.devolucionDescripcion().trim()) {
      this.toast.error('Contanos el motivo de la devolución.');
      return;
    }

    this.guardando.set(true);
    this.clientePortal.crearDevolucion({
      idPedido,
      motivo: this.devolucionMotivo(),
      descripcion: this.devolucionDescripcion().trim(),
    }).subscribe({
      next: sol => {
        this.devoluciones.update(list => [sol, ...list]);
        this.crearDevolucionVisible.set(false);
        this.guardando.set(false);
        this.toast.exito('Solicitud de devolución enviada.');
        this.verDevolucion(sol);
      },
      error: err => {
        this.guardando.set(false);
        const msg = err?.error?.message ?? err?.error?.mensaje;
        this.toast.error(typeof msg === 'string' ? msg : 'No se pudo crear la solicitud.');
      },
    });
  }

  verDevolucion(sol: SolicitudDevolucion): void {
    if (sol.idSolicitud == null) {
      this.devolucionDetalle.set(sol);
      return;
    }
    this.crearDevolucionVisible.set(false);
    this.clientePortal.obtenerDevolucion(sol.idSolicitud).subscribe({
      next: d => this.devolucionDetalle.set(d),
      error: () => this.devolucionDetalle.set(sol),
    });
  }

  cerrarDevolucion(): void {
    this.devolucionDetalle.set(null);
  }

  cambiarPassword(): void {
    this.passError.set(null);
    this.passExito.set(false);

    if (this.passNueva().length < 8) {
      this.passError.set('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (this.passNueva() !== this.passConfirmar()) {
      this.passError.set('Las contraseñas no coinciden.');
      return;
    }

    const sesion = this.authService.getUsuario();
    if (!sesion) return;

    this.guardando.set(true);
    this.authService.actualizarPerfil({
      nombre: sesion.nombre,
      email: sesion.email,
      contrasena: this.passNueva(),
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.passExito.set(true);
        this.passActual.set('');
        this.passNueva.set('');
        this.passConfirmar.set('');
        this.toast.exito('Contraseña actualizada correctamente.');
      },
      error: err => {
        this.guardando.set(false);
        const msg = err?.error?.message ?? err?.error?.mensaje;
        const texto = typeof msg === 'string' ? msg : 'No se pudo cambiar la contraseña.';
        this.passError.set(texto);
        this.toast.error(texto);
      },
    });
  }
}
