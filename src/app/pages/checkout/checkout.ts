import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { forkJoin, of, switchMap, map, catchError, Observable } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { PedidoService, DetallePedidoService } from '../../services/pedido.service';
import { PagoService } from '../../services/pago.service';
import { PlanCuotasService } from '../../services/plan-cuotas.service';
import { PerfilService } from '../../services/perfil.service';
import { EnvioService } from '../../services/envio.service';
import { Pedido, DetallePedido, Pago, PlanCuotas, Envio, Usuario, Product, PerfilCliente } from '../../models/models';
import { generarQrSvg } from '../../utils/qrcode';

// Una opcion de financiacion para "Prestamos de la casa".
// cuotas: en cuantas veces se paga. interes: porcentaje que se le suma al total.
interface PlanFinanciacion {
  cuotas: number;
  interes: number;
}

// Pagina de CHECKOUT (confirmar la compra).
// Ahora ofrece un ECOSISTEMA de pagos: Tarjeta, Efectivo, Transferencia,
// Mercado Pago, Billetera virtual, QR y Prestamos de la casa (en cuotas).
// Al confirmar, crea en el backend todo lo que implica una compra:
//   1) el Pedido (POST /pedidos)
//   2) un renglon DetallePedido por cada producto (POST /detalle-pedidos)
//   3) el Pago con el metodo elegido (POST /pagos)
//   4) el Envio (POST /envios)
//   5) si es "Prestamo de la casa", ademas un PlanCuotas (POST /planes)
// Despues vacia el carrito y muestra la confirmacion.
//
// IMPORTANTE: todos los pagos estan SIMULADOS (no hay pasarela real conectada).
// El pago igual se REGISTRA de verdad en la base de datos via la API.
@Component({
  selector: 'app-checkout',
  imports: [FormsModule, RouterLink, DecimalPipe, NgClass],
  templateUrl: './checkout.html',
})
export class Checkout {

  // Datos de envio.
  direccion = '';
  empresa = 'Andreani';

  // Metodo de pago elegido. Arranca en TARJETA.
  // Valores: TARJETA, EFECTIVO, TRANSFERENCIA, MERCADO_PAGO,
  // BILLETERA_VIRTUAL, QR, PRESTAMO_CASA.
  metodoPago = signal('TARJETA');

  // --- Datos del sub-flujo "Tarjeta" (simulado, sin validar de verdad) ---
  tarjetaNumero = '';
  tarjetaVencimiento = '';
  tarjetaTitular = '';

  // --- Sub-flujo "Mercado Pago" ---
  mpProcesando = signal(false); // mientras "inicia" el pago simulado
  mpAprobado = signal(false);    // queda true cuando el pago simulado se "aprueba"

  // --- Sub-flujo "Billetera virtual" ---
  // Lista de billeteras que ofrecemos para elegir.
  billeteras = ['MODO', 'Uala', 'Naranja X', 'Personal Pay', 'Mercado Pago'];
  billeteraSeleccionada = '';
  billeteraConfirmada = signal(false);

  // --- Sub-flujo "QR" ---
  qrSvg = signal<SafeHtml | null>(null); // el <svg> del QR ya dibujado
  qrReferencia = '';                       // referencia simulada que va dentro del QR
  qrConfirmado = signal(false);            // true cuando el usuario dice "ya pague"

  // --- Sub-flujo "Prestamos de la casa" (financiacion en cuotas) ---
  // Cada plan tiene una cantidad de cuotas y su tasa de interes.
  planes: PlanFinanciacion[] = [
    { cuotas: 3, interes: 10 },
    { cuotas: 6, interes: 20 },
    { cuotas: 12, interes: 35 },
  ];
  planSeleccionado = signal<PlanFinanciacion>(this.planes[0]);

  // Total de los productos (lo que sale el carrito, sin financiar).
  total = computed(() => this.cart.total());

  // Total con interes aplicado (solo tiene sentido para el prestamo).
  totalFinanciado = computed(() =>
    this.redondear(this.cart.total() * (1 + this.planSeleccionado().interes / 100))
  );

  // Cuanto sale cada cuota del prestamo.
  valorCuota = computed(() =>
    this.redondear(this.totalFinanciado() / this.planSeleccionado().cuotas)
  );

  // Monto que finalmente se cobra: si es prestamo, el total financiado; si no, el total normal.
  montoAPagar = computed(() =>
    this.metodoPago() === 'PRESTAMO_CASA' ? this.totalFinanciado() : this.total()
  );

  // Estados de la pantalla.
  procesando = signal(false);
  exito = signal(false);
  error = signal<string | null>(null);
  numeroPedido = signal<number | null>(null);

  constructor(
    public cart: CartService,
    private auth: AuthService,
    private pedidoService: PedidoService,
    private detalleService: DetallePedidoService,
    private pagoService: PagoService,
    private planService: PlanCuotasService,
    private perfilService: PerfilService,
    private envioService: EnvioService,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {}

  // Redondea a 2 decimales (para que la plata no quede con muchos decimales).
  private redondear(n: number): number {
    return Math.round(n * 100) / 100;
  }

  // Cambia el metodo de pago elegido y resetea los estados de cada sub-flujo.
  seleccionarMetodo(metodo: string): void {
    this.metodoPago.set(metodo);
    this.error.set(null);
    this.mpProcesando.set(false);
    this.mpAprobado.set(false);
    this.billeteraConfirmada.set(false);
    this.qrConfirmado.set(false);
    // Si elige QR, generamos el codigo en el momento.
    if (metodo === 'QR') {
      this.generarQr();
    }
  }

  // Elige un plan de cuotas (lo usa el sub-flujo del prestamo).
  seleccionarPlan(plan: PlanFinanciacion): void {
    this.planSeleccionado.set(plan);
  }

  // --- Mercado Pago: simulamos el inicio del pago y su aprobacion ---
  iniciarPagoMercadoPago(): void {
    this.mpProcesando.set(true);
    this.mpAprobado.set(false);
    // TODO INTEGRACION REAL DE MERCADO PAGO:
    //   Aca iria la llamada real a Mercado Pago: con las credenciales del
    //   vendedor se crea una "preference" (POST a la API de MP) y se redirige
    //   al init_point del checkout, o se usa el SDK de Checkout Pro / Bricks.
    //   Cuando MP confirma el pago (via redirect o webhook) reciem ahi se
    //   marca como aprobado. Por ahora lo simulamos con un pequenio delay.
    setTimeout(() => {
      this.mpProcesando.set(false);
      this.mpAprobado.set(true);
    }, 1200);
  }

  // --- Billetera virtual: confirmamos la billetera elegida (simulado) ---
  confirmarBilletera(): void {
    if (!this.billeteraSeleccionada) {
      this.error.set('Elegi una billetera virtual.');
      return;
    }
    this.error.set(null);
    this.billeteraConfirmada.set(true);
  }

  // --- QR: arma el codigo QR a partir del monto del carrito ---
  generarQr(): void {
    // Referencia simulada que viaja dentro del QR (no es de ninguna pasarela real).
    this.qrReferencia = 'QR-' + Date.now();
    const payload = `NOVATECH|MONTO:${this.cart.total().toFixed(2)}|REF:${this.qrReferencia}`;
    // generarQrSvg devuelve un <svg> como texto; lo marcamos como confiable para inyectarlo.
    this.qrSvg.set(this.sanitizer.bypassSecurityTrustHtml(generarQrSvg(payload, 2)));
    this.qrConfirmado.set(false);
  }

  // --- QR: el usuario nos dice que ya escaneo y pago (simulado) ---
  confirmarPagoQr(): void {
    this.qrConfirmado.set(true);
    this.error.set(null);
  }

  // Valida que el sub-flujo del metodo elegido este completo antes de finalizar.
  // Devuelve un mensaje de error o null si esta todo OK.
  private validarMetodo(): string | null {
    switch (this.metodoPago()) {
      case 'TARJETA':
        if (!this.tarjetaNumero.trim() || !this.tarjetaTitular.trim()) {
          return 'Completa los datos de la tarjeta.';
        }
        return null;
      case 'MERCADO_PAGO':
        if (!this.mpAprobado()) {
          return 'Primero realiza el pago con Mercado Pago.';
        }
        return null;
      case 'BILLETERA_VIRTUAL':
        if (!this.billeteraConfirmada()) {
          return 'Confirma el pago con la billetera virtual.';
        }
        return null;
      case 'QR':
        if (!this.qrConfirmado()) {
          return 'Confirma que ya escaneaste y pagaste el QR.';
        }
        return null;
      default:
        // EFECTIVO, TRANSFERENCIA y PRESTAMO_CASA no necesitan pasos extra.
        return null;
    }
  }

  // Arma el objeto Pago segun el metodo elegido (con sus datos extra).
  private armarPago(idPedido: number): Pago {
    const pago: Pago = {
      pedido: { idPedido } as Pedido,
      monto: this.montoAPagar(),
      metodo: this.metodoPago(),
      estado: 'APROBADO',
    };

    // Segun el metodo, le agregamos la referencia / proveedor que corresponda.
    switch (this.metodoPago()) {
      case 'TARJETA':
        pago.referencia = 'TARJ-' + Date.now();
        break;
      case 'MERCADO_PAGO':
        pago.referencia = 'MP-' + Date.now();
        break;
      case 'BILLETERA_VIRTUAL':
        pago.proveedorBilletera = this.billeteraSeleccionada;
        pago.referencia = 'BV-' + Date.now();
        break;
      case 'QR':
        pago.referencia = this.qrReferencia;
        break;
      case 'PRESTAMO_CASA':
        pago.referencia = 'PREST-' + Date.now();
        break;
    }
    return pago;
  }

  // Se ejecuta al confirmar la compra.
  confirmar(): void {
    const usuario = this.auth.getUsuario();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    const items = this.cart.items();
    if (items.length === 0) {
      this.error.set('Tu carrito esta vacio.');
      return;
    }
    if (!this.direccion.trim()) {
      this.error.set('Ingresa una direccion de envio.');
      return;
    }

    // Validamos que el sub-flujo del metodo de pago este completo.
    const errorMetodo = this.validarMetodo();
    if (errorMetodo) {
      this.error.set(errorMetodo);
      return;
    }

    this.error.set(null);
    this.procesando.set(true);

    const total = this.cart.total();
    const esPrestamo = this.metodoPago() === 'PRESTAMO_CASA';

    // Si es prestamo, primero buscamos el perfil del cliente (para asociarlo al plan).
    // Si no lo encontramos, igual seguimos: el plan se crea sin cliente.
    const cliente$: Observable<PerfilCliente | null> = esPrestamo
      ? this.perfilService.listar().pipe(
          map(perfiles => perfiles.find(p => p.usuario?.idUsuario === usuario.idUsuario) ?? null),
          catchError(() => of(null)),
        )
      : of(null);

    cliente$.pipe(
      switchMap(perfil => {
        // 1) Armamos el pedido. El total del pedido es el de los productos.
        const pedido = {
          usuario: { idUsuario: usuario.idUsuario } as Usuario,
          estado: 'PAGADO',
          total,
        } as Pedido;

        // Creamos el pedido y, con su id, todo lo demas.
        return this.pedidoService.crear(pedido).pipe(
          switchMap(pedidoCreado => {
            const idPedido = pedidoCreado.idPedido!;
            this.numeroPedido.set(idPedido);

            // 2) Un detalle (renglon) por cada producto del carrito.
            const detalles = items.map(item =>
              this.detalleService.crear({
                pedido: { idPedido } as Pedido,
                producto: { idProducto: item.producto.idProducto } as Product,
                cantidad: item.cantidad,
                precioUnitario: Number(item.producto.precio),
              } as DetallePedido)
            );

            // 3) El pago del pedido (con el metodo elegido y sus datos).
            const pago = this.pagoService.crear(this.armarPago(idPedido));

            // 4) El envio del pedido.
            const envio = this.envioService.crear({
              pedido: { idPedido } as Pedido,
              direccionEnvio: this.direccion,
              empresaLogistica: this.empresa,
            } as Envio);

            // Juntamos todas las llamadas que hay que esperar.
            // Las tipamos como Observable<unknown> porque devuelven cosas distintas.
            const llamadas: Observable<unknown>[] = [...detalles, pago, envio];

            // 5) Si es prestamo de la casa, ademas creamos el PlanCuotas.
            if (esPrestamo) {
              const plan = {
                cliente: perfil ? ({ idCliente: perfil.idCliente } as PerfilCliente) : undefined,
                pedido: { idPedido } as Pedido,
                cantidadCuotas: this.planSeleccionado().cuotas,
                interes: this.planSeleccionado().interes,
                estado: 'ACTIVO',
              } as PlanCuotas;
              llamadas.push(this.planService.crear(plan));
            }

            // forkJoin espera a que TODAS estas llamadas terminen.
            return forkJoin(llamadas);
          })
        );
      })
    ).subscribe({
      next: () => {
        // Todo OK: vaciamos el carrito y mostramos la confirmacion.
        this.cart.vaciar();
        this.procesando.set(false);
        this.exito.set(true);
      },
      error: () => {
        this.procesando.set(false);
        this.error.set('Hubo un problema al procesar la compra. Intenta de nuevo.');
      },
    });
  }
}
