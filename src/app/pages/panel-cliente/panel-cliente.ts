import {
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { AuthService, UsuarioSesion } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { PerfilService } from '../../services/perfil.service';
import { FacturaService } from '../../services/factura.service';
import {
  Envio,
  Factura,
  Pedido,
  PedidoDetalleResponse,
  PerfilCliente,
} from '../../models/models';

type SeccionPanel =
  | 'perfil'
  | 'pedidos'
  | 'direcciones'
  | 'facturas'
  | 'seguridad';

@Component({
  selector: 'app-panel-cliente',
  imports: [FormsModule, DecimalPipe, DatePipe, NgClass, RouterLink],
  templateUrl: './panel-cliente.html',
  styleUrl: './panel-cliente.css',
})
export class PanelCliente implements OnInit {
  seccionActiva = signal<SeccionPanel>('perfil');

  usuario = signal<UsuarioSesion | null>(null);
  perfilCliente = signal<PerfilCliente | null>(null);
  pedidos = signal<Pedido[]>([]);
  detallesPorPedido = signal<Map<number, PedidoDetalleResponse>>(new Map());
  facturas = signal<Factura[]>([]);

  cargando = signal(true);
  error = signal<string | null>(null);
  guardando = signal(false);

  pedidoDetalle = signal<Pedido | null>(null);

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

  secciones: { id: SeccionPanel; label: string; icon: string }[] = [
    { id: 'perfil',      label: 'Perfil',      icon: '👤' },
    { id: 'pedidos',     label: 'Pedidos',      icon: '📦' },
    { id: 'direcciones', label: 'Direcciones',  icon: '📍' },
    { id: 'facturas',    label: 'Facturas',     icon: '🧾' },
    { id: 'seguridad',   label: 'Seguridad',    icon: '🔒' },
  ];

  pedidosActivos = computed(() =>
    this.pedidos().filter(p => p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO'),
  );

  pedidosHistorial = computed(() =>
    this.pedidos().filter(p => p.estado === 'ENTREGADO' || p.estado === 'CANCELADO'),
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
    private pedidoService: PedidoService,
    private perfilService: PerfilService,
    private facturaService: FacturaService,
    private toast: ToastService,
    private route: ActivatedRoute,
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
      pedidos: this.pedidoService.listar(),
      perfiles: this.perfilService.listar(),
      facturas: this.facturaService.listar(),
    }).subscribe({
      next: ({ pedidos, perfiles, facturas }) => {
        const mios = pedidos
          .filter(p => p.usuario?.idUsuario === sesion.idUsuario)
          .sort((a, b) => (b.idPedido ?? 0) - (a.idPedido ?? 0));
        this.pedidos.set(mios);

        const perfil = perfiles.find(p => p.usuario?.idUsuario === sesion.idUsuario) ?? null;
        this.perfilCliente.set(perfil);
        this.perfilTelefono.set(perfil?.telefono ?? '');
        this.direccionCalle.set(perfil?.direccion ?? '');
        this.direccionCiudad.set(perfil?.ciudad ?? '');

        const misFacturas = facturas
          .filter(f => f.pedido?.usuario?.idUsuario === sesion.idUsuario)
          .sort((a, b) => (b.fechaEmision ?? '').localeCompare(a.fechaEmision ?? ''));
        this.facturas.set(misFacturas);

        this.cargando.set(false);
        this.cargarDetallesPedidos(mios);
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

    forkJoin(ids.map(id => this.pedidoService.obtenerDetalle(id))).subscribe({
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

  irA(seccion: SeccionPanel): void {
    this.seccionActiva.set(seccion);
    this.pedidoDetalle.set(null);
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

    this.guardando.set(true);
    this.authService.actualizarPerfil({
      nombre: this.perfilNombre().trim(),
      email: this.perfilEmail().trim(),
    }).subscribe({
      next: u => {
        this.usuario.set(u);
        this.perfilEditando.set(false);
        this.guardando.set(false);
        this.toast.exito('Perfil actualizado correctamente.');
        this.guardarTelefonoPerfil();
      },
      error: () => {
        this.guardando.set(false);
        this.toast.error('No se pudo guardar el perfil.');
      },
    });
  }

  private guardarTelefonoPerfil(): void {
    const perfil = this.perfilCliente();
    const sesion = this.authService.getUsuario();
    if (!sesion || !this.perfilTelefono().trim()) return;

    const payload: PerfilCliente = {
      ...(perfil ?? { usuario: { idUsuario: sesion.idUsuario, nombre: sesion.nombre, email: sesion.email, rol: sesion.rol } }),
      telefono: this.perfilTelefono().trim(),
    };

    if (perfil?.idCliente != null) {
      this.perfilService.actualizar(perfil.idCliente, payload).subscribe({
        next: p => this.perfilCliente.set(p),
      });
    } else {
      this.perfilService.crear(payload).subscribe({
        next: p => this.perfilCliente.set(p),
      });
    }
  }

  verDetallePedido(p: Pedido): void {
    this.pedidoDetalle.set(p);
    if (p.idPedido != null && !this.detallesPorPedido().has(p.idPedido)) {
      this.pedidoService.obtenerDetalle(p.idPedido).subscribe({
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

    const sesion = this.authService.getUsuario();
    if (!sesion) return;

    this.guardando.set(true);
    const perfil = this.perfilCliente();
    const payload: PerfilCliente = {
      ...(perfil ?? { usuario: { idUsuario: sesion.idUsuario, nombre: sesion.nombre, email: sesion.email, rol: sesion.rol } }),
      direccion: this.direccionCalle().trim(),
      ciudad: this.direccionCiudad().trim(),
      telefono: this.perfilTelefono().trim() || perfil?.telefono,
    };

    const req = perfil?.idCliente != null
      ? this.perfilService.actualizar(perfil.idCliente, payload)
      : this.perfilService.crear(payload);

    req.subscribe({
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
