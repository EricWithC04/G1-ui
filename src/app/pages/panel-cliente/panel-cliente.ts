import {
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { OrdenVentaService } from '../../services/orden-venta.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Usuario, Pedido, Factura } from '../../models/models';

type SeccionPanel =
  | 'perfil'
  | 'pedidos'
  | 'direcciones'
  | 'facturas'
  | 'seguridad';

type EstadoPedido =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

@Component({
  selector: 'app-panel-cliente',
  imports: [FormsModule, DecimalPipe, DatePipe, NgClass, RouterLink],
  templateUrl: './panel-cliente.html',
  styleUrl: './panel-cliente.css',
})
export class PanelCliente implements OnInit {
  // ── Sección activa ──────────────────────────────────────────────
  seccionActiva = signal<SeccionPanel>('perfil');

  // ── Datos ───────────────────────────────────────────────────────
  usuario = signal<Usuario | null>(null);
  pedidos = signal<Pedido[]>([]);
  direcciones = signal<any[]>([]);
  facturas = signal<Factura[]>([]);

  // ── Estados de carga ────────────────────────────────────────────
  cargando = signal(true);
  error = signal<string | null>(null);
  guardando = signal(false);

  // ── Pedido seleccionado para detalle ────────────────────────────
  pedidoDetalle = signal<Pedido | null>(null);

  // ── Perfil editable ─────────────────────────────────────────────
  perfilEditando = signal(false);
  perfilNombre = signal('');
  perfilEmail = signal('');
  perfilTelefono = signal('');

  // ── Nueva dirección ─────────────────────────────────────────────
  agregarDireccion = signal(false);
  nuevaDireccionCalle = signal('');
  nuevaDireccionCiudad = signal('');
  nuevaDireccionProvincia = signal('');
  nuevaDireccionCodPostal = signal('');
  nuevaDireccionPais = signal('Argentina');
  nuevaDireccionEsPrincipal = signal(false);

  // ── Seguridad ───────────────────────────────────────────────────
  passActual = signal('');
  passNueva = signal('');
  passConfirmar = signal('');
  passError = signal<string | null>(null);
  passExito = signal(false);

  // ── Computed ────────────────────────────────────────────────────
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

  direccionPrincipal = computed(() =>
    this.direcciones().find(d => d.esPrincipal) ?? this.direcciones()[0] ?? null,
  );

  puedeCambiarPass = computed(() =>
    !!this.passActual() && !!this.passNueva() && this.passNueva().length >= 8 && !this.guardando(),
  );

  constructor(
    private usuarioService: UsuarioService,
    private ordenVentaService: OrdenVentaService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargando.set(false);
    this.error.set(null);
    // Cargar usuario actual (ajustar al método real del servicio)
    const u = this.authService.getUsuario()!
    // .subscribe({
    //   next: (u: Usuario) => {
        this.usuario.set(u);
        this.perfilNombre.set(u.nombre ?? '');
        this.perfilEmail.set(u.email ?? '');
        this.perfilTelefono.set('');
    //   },
    //   error: () => this.error.set('No se pudo cargar el perfil.'),
    // });
  }

    // Cargar pedidos del cliente
    // this.ordenVentaService.listarMisPedidos().subscribe({
    //   next: list => {
    //     this.pedidos.set(list);
    //     this.cargando.set(false);
    //   },
    //   error: () => {
    //     this.error.set('No se pudieron cargar los pedidos.');
    //     this.cargando.set(false);
    //   },
    // });

    // Cargar direcciones
    // this.usuarioService.listarDirecciones().subscribe({
    //   next: list => this.direcciones.set(list),
    //   error: () => {},
    // });

    // Cargar facturas
//     this.usuarioService.listarFacturas().subscribe({
//       next: list => this.facturas.set(list),
//       error: () => {},
//     });
//   }

  // ── Navegación ──────────────────────────────────────────────────
  irA(seccion: SeccionPanel): void {
    this.seccionActiva.set(seccion);
    this.pedidoDetalle.set(null);
    this.perfilEditando.set(false);
    this.agregarDireccion.set(false);
    this.passError.set(null);
    this.passExito.set(false);
  }

  // ── Perfil ──────────────────────────────────────────────────────
  iniciarEdicionPerfil(): void {
    // const u = this.usuario();
    // if (!u) return;
    // this.perfilNombre.set(u.nombre ?? '');
    // this.perfilEmail.set(u.email ?? '');
    // this.perfilTelefono.set(u.telefono ?? '');
    // this.perfilEditando.set(true);
  }

  cancelarEdicionPerfil(): void {
    // this.perfilEditando.set(false);
  }

  guardarPerfil(): void {
    // if (!this.perfilNombre().trim()) {
    //   this.toast.error('El nombre no puede estar vacío.');
    //   return;
    // }

    // this.guardando.set(true);
    // this.usuarioService.actualizarPerfil({
    //   nombre: this.perfilNombre(),
    //   email: this.perfilEmail(),
    //   telefono: this.perfilTelefono(),
    // }).subscribe({
    //   next: u => {
    //     this.usuario.set(u);
    //     this.perfilEditando.set(false);
    //     this.guardando.set(false);
    //     this.toast.exito('Perfil actualizado correctamente.');
    //   },
    //   error: () => {
    //     this.guardando.set(false);
    //     this.toast.error('No se pudo guardar el perfil.');
    //   },
    // });
  }

//   ── Pedidos ─────────────────────────────────────────────────────
  verDetallePedido(p: Pedido): void {
    // this.pedidoDetalle.set(p);
  }

  cerrarDetalle(): void {
    // this.pedidoDetalle.set(null);
  }

  estadoLabel(estado: EstadoPedido | string): string {
    // const map: Record<string, string> = {
    //   PENDIENTE: 'Pendiente',
    //   CONFIRMADO: 'Confirmado',
    //   EN_PREPARACION: 'En preparación',
    //   EN_CAMINO: 'En camino',
    //   ENTREGADO: 'Entregado',
    //   CANCELADO: 'Cancelado',
    // };
    // return map[estado] ?? estado;
    return ""
}

  estadoBadgeClass(estado: string): string {
    // const map: Record<string, string> = {
    //   PENDIENTE:      'pc-badge--pending',
    //   CONFIRMADO:     'pc-badge--confirmed',
    //   EN_PREPARACION: 'pc-badge--preparing',
    //   EN_CAMINO:      'pc-badge--shipping',
    //   ENTREGADO:      'pc-badge--delivered',
    //   CANCELADO:      'pc-badge--cancelled',
    // };
    // return map[estado] ?? '';
    return ""
  }

  pasoTracking(estado: string): number {
    // const pasos: Record<string, number> = {
    //   PENDIENTE: 1,
    //   CONFIRMADO: 2,
    //   EN_PREPARACION: 3,
    //   EN_CAMINO: 4,
    //   ENTREGADO: 5,
    // };
    // return pasos[estado] ?? 0;
    return 0
  }

  // ── Direcciones ─────────────────────────────────────────────────
  iniciarNuevaDireccion(): void {
    // this.nuevaDireccionCalle.set('');
    // this.nuevaDireccionCiudad.set('');
    // this.nuevaDireccionProvincia.set('');
    // this.nuevaDireccionCodPostal.set('');
    // this.nuevaDireccionPais.set('Argentina');
    // this.nuevaDireccionEsPrincipal.set(false);
    // this.agregarDireccion.set(true);
  }

  cancelarNuevaDireccion(): void {
    // this.agregarDireccion.set(false);
  }

  guardarDireccion(): void {
    // if (!this.nuevaDireccionCalle().trim() || !this.nuevaDireccionCiudad().trim()) {
    //   this.toast.error('Completá calle y ciudad.');
    //   return;
    // }

    // this.guardando.set(true);
    // const payload: Omit<Direccion, 'idDireccion'> = {
    //   calle: this.nuevaDireccionCalle(),
    //   ciudad: this.nuevaDireccionCiudad(),
    //   provincia: this.nuevaDireccionProvincia(),
    //   codigoPostal: this.nuevaDireccionCodPostal(),
    //   pais: this.nuevaDireccionPais(),
    //   esPrincipal: this.nuevaDireccionEsPrincipal(),
    // };

    // this.usuarioService.agregarDireccion(payload).subscribe({
    //   next: lista => {
    //     this.direcciones.set(lista);
    //     this.agregarDireccion.set(false);
    //     this.guardando.set(false);
    //     this.toast.exito('Dirección guardada.');
    //   },
    //   error: () => {
    //     this.guardando.set(false);
    //     this.toast.error('No se pudo guardar la dirección.');
    //   },
    // });
  }

  eliminarDireccion(id: number): void {
    // this.usuarioService.eliminarDireccion(id).subscribe({
    //   next: lista => {
    //     this.direcciones.set(lista);
    //     this.toast.exito('Dirección eliminada.');
    //   },
    //   error: () => this.toast.error('No se pudo eliminar la dirección.'),
    // });
  }

  marcarPrincipal(id: number): void {
    // this.usuarioService.marcarDireccionPrincipal(id).subscribe({
    //   next: lista => {
    //     this.direcciones.set(lista);
    //     this.toast.exito('Dirección principal actualizada.');
    //   },
    //   error: () => this.toast.error('No se pudo actualizar la dirección.'),
    // });
  }

  // ── Facturas ────────────────────────────────────────────────────
  descargarFactura(factura: Factura): void {
    // this.usuarioService.descargarFactura(factura.idFactura).subscribe({
    //   next: blob => {
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = `Factura-${factura.numero}.pdf`;
    //     a.click();
    //     URL.revokeObjectURL(url);
    //     this.toast.exito('Factura descargada.');
    //   },
    //   error: () => this.toast.error('No se pudo descargar la factura.'),
    // });
  }

  // ── Seguridad ───────────────────────────────────────────────────
  cambiarPassword(): void {
    // this.passError.set(null);
    // this.passExito.set(false);

    // if (this.passNueva().length < 8) {
    //   this.passError.set('La nueva contraseña debe tener al menos 8 caracteres.');
    //   return;
    // }

    // if (this.passNueva() !== this.passConfirmar()) {
    //   this.passError.set('Las contraseñas no coinciden.');
    //   return;
    // }

    // this.guardando.set(true);
    // this.usuarioService.cambiarPassword({
    //   actual: this.passActual(),
    //   nueva: this.passNueva(),
    // }).subscribe({
    //   next: () => {
    //     this.guardando.set(false);
    //     this.passExito.set(true);
    //     this.passActual.set('');
    //     this.passNueva.set('');
    //     this.passConfirmar.set('');
    //     this.toast.exito('Contraseña actualizada correctamente.');
    //   },
    //   error: err => {
    //     this.guardando.set(false);
    //     const msg = err?.error?.message ?? err?.error?.mensaje;
    //     const texto = typeof msg === 'string' ? msg : 'No se pudo cambiar la contraseña.';
    //     this.passError.set(texto);
    //     this.toast.error(texto);
    //   },
    // });
    }
}