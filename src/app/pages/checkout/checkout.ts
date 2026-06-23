import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrdenVentaService } from '../../services/orden-venta.service';
import { ConfirmarOrdenRequest } from '../../models/models';
import { generarQrSvg } from '../../utils/qrcode';
import {
  esTarjetaNumero,
  esTextoRequerido,
  esVencimientoTarjeta,
  mensajeTarjetaNumero,
  mensajeTextoRequerido,
  mensajeVencimientoTarjeta,
  primerErrorCampos,
} from '../../utils/validadores-form';

interface PlanFinanciacion {
  cuotas: number;
  interes: number;
}

@Component({
  selector: 'app-checkout',
  imports: [FormsModule, RouterLink, DecimalPipe, NgClass],
  templateUrl: './checkout.html',
})
export class Checkout {

  direccion = '';
  empresa = 'Andreani';
  tipoEntrega = signal<'ENVIO' | 'RETIRO_TIENDA'>('ENVIO');

  metodoPago = signal('TARJETA');

  tarjetaNumero = '';
  tarjetaVencimiento = '';
  tarjetaTitular = '';

  mpProcesando = signal(false);
  mpAprobado = signal(false);

  billeteras = ['MODO', 'Uala', 'Naranja X', 'Personal Pay', 'Mercado Pago'];
  billeteraSeleccionada = '';
  billeteraConfirmada = signal(false);

  qrSvg = signal<SafeHtml | null>(null);
  qrReferencia = '';
  qrConfirmado = signal(false);

  cuotasPrestamo = signal(6);
  interesPrestamo = signal(20);
  cuotasOpciones = Array.from({ length: 24 }, (_, i) => i + 1);
  atajosPrestamo: PlanFinanciacion[] = [
    { cuotas: 3, interes: 10 },
    { cuotas: 6, interes: 20 },
    { cuotas: 12, interes: 35 },
    { cuotas: 24, interes: 50 },
  ];

  planSeleccionado = computed<PlanFinanciacion>(() => ({
    cuotas: this.cuotasPrestamo(),
    interes: this.interesPrestamo(),
  }));

  total = computed(() => this.cart.total());

  totalFinanciado = computed(() =>
    this.redondear(this.cart.total() * (1 + this.planSeleccionado().interes / 100))
  );

  valorCuota = computed(() =>
    this.redondear(this.totalFinanciado() / this.planSeleccionado().cuotas)
  );

  montoAPagar = computed(() =>
    this.metodoPago() === 'PRESTAMO_CASA' ? this.totalFinanciado() : this.total()
  );

  procesando = signal(false);
  exito = signal(false);
  error = signal<string | null>(null);
  numeroPedido = signal<number | null>(null);

  erroresCampo = signal<Record<string, string>>({});

  constructor(
    public cart: CartService,
    public auth: AuthService,
    private ordenVentaService: OrdenVentaService,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {}

  private redondear(n: number): number {
    return Math.round(n * 100) / 100;
  }

  seleccionarMetodo(metodo: string): void {
    this.metodoPago.set(metodo);
    this.error.set(null);
    this.erroresCampo.set({});
    this.mpProcesando.set(false);
    this.mpAprobado.set(false);
    this.billeteraConfirmada.set(false);
    this.qrConfirmado.set(false);
    if (metodo === 'QR') {
      this.generarQr();
    }
  }

  seleccionarTipoEntrega(tipo: 'ENVIO' | 'RETIRO_TIENDA'): void {
    this.tipoEntrega.set(tipo);
    this.error.set(null);
  }

  aplicarAtajo(plan: PlanFinanciacion): void {
    this.cuotasPrestamo.set(plan.cuotas);
    this.interesPrestamo.set(plan.interes);
  }

  iniciarPagoMercadoPago(): void {
    this.mpProcesando.set(true);
    this.mpAprobado.set(false);
    setTimeout(() => {
      this.mpProcesando.set(false);
      this.mpAprobado.set(true);
    }, 1200);
  }

  confirmarBilletera(): void {
    if (!this.billeteraSeleccionada) {
      this.error.set('Elegi una billetera virtual.');
      return;
    }
    this.error.set(null);
    this.billeteraConfirmada.set(true);
  }

  generarQr(): void {
    this.qrReferencia = 'QR-' + Date.now();
    const payload = `NOVATECH|MONTO:${this.cart.total().toFixed(2)}|REF:${this.qrReferencia}`;
    this.qrSvg.set(this.sanitizer.bypassSecurityTrustHtml(generarQrSvg(payload, 2)));
    this.qrConfirmado.set(false);
  }

  confirmarPagoQr(): void {
    this.qrConfirmado.set(true);
    this.error.set(null);
  }

  private validarMetodo(): string | null {
    const errores: Record<string, string> = {};
    switch (this.metodoPago()) {
      case 'TARJETA':
        if (!esTarjetaNumero(this.tarjetaNumero)) {
          errores['tarjetaNumero'] = mensajeTarjetaNumero();
        }
        if (!esVencimientoTarjeta(this.tarjetaVencimiento)) {
          errores['tarjetaVencimiento'] = mensajeVencimientoTarjeta();
        }
        if (!esTextoRequerido(this.tarjetaTitular, 3)) {
          errores['tarjetaTitular'] = mensajeTextoRequerido('Titular', 3);
        }
        if (Object.keys(errores).length > 0) {
          this.erroresCampo.set(errores);
          return 'Completa los datos de la tarjeta correctamente.';
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
      case 'PRESTAMO_CASA':
        if (this.cuotasPrestamo() < 1 || this.cuotasPrestamo() > 24) {
          return 'Elegí entre 1 y 24 cuotas.';
        }
        if (this.interesPrestamo() < 0 || this.interesPrestamo() > 100) {
          return 'Interés entre 0 y 100%.';
        }
        return null;
      default:
        return null;
    }
  }

  private armarReferencia(): string | undefined {
    switch (this.metodoPago()) {
      case 'TARJETA':
        return 'TARJ-' + Date.now();
      case 'MERCADO_PAGO':
        return 'MP-' + Date.now();
      case 'BILLETERA_VIRTUAL':
        return 'BV-' + Date.now();
      case 'QR':
        return this.qrReferencia;
      case 'PRESTAMO_CASA':
        return 'PREST-' + Date.now();
      default:
        return undefined;
    }
  }

  confirmar(): void {
    const usuario = this.auth.getUsuario();
    if (!usuario?.idUsuario) {
      this.router.navigate(['/login']);
      return;
    }

    const items = this.cart.items();
    if (items.length === 0) {
      this.error.set('Tu carrito esta vacio.');
      return;
    }

    const errores: Record<string, string> = {};
    if (this.tipoEntrega() === 'ENVIO') {
      if (!esTextoRequerido(this.direccion, 10)) {
        errores['direccion'] = mensajeTextoRequerido('Dirección de envío', 10);
      }
    }
    this.erroresCampo.set(errores);
    if (Object.keys(errores).length > 0) {
      this.error.set('Revisá los datos de entrega.');
      return;
    }

    const errorMetodo = this.validarMetodo();
    if (errorMetodo) {
      this.error.set(errorMetodo);
      return;
    }

    this.error.set(null);
    this.erroresCampo.set({});
    this.procesando.set(true);

    const esPrestamo = this.metodoPago() === 'PRESTAMO_CASA';
    const request: ConfirmarOrdenRequest = {
      idUsuario: usuario.idUsuario,
      lineas: items.map(item => ({
        idProducto: item.producto.idProducto!,
        cantidad: item.cantidad,
      })),
      metodoPago: this.metodoPago(),
      tipoEntrega: this.tipoEntrega(),
      canalOrigen: 'WEB',
      direccionEnvio: this.tipoEntrega() === 'ENVIO' ? this.direccion.trim() : undefined,
      empresaLogistica: this.empresa,
      referencia: this.armarReferencia(),
      proveedorBilletera: this.metodoPago() === 'BILLETERA_VIRTUAL' ? this.billeteraSeleccionada : undefined,
      cantidadCuotas: esPrestamo ? this.planSeleccionado().cuotas : undefined,
      interes: esPrestamo ? this.planSeleccionado().interes : undefined,
    };

    this.ordenVentaService.confirmar(request).subscribe({
      next: (resp) => {
        this.numeroPedido.set(resp.pedido.idPedido ?? null);
        this.cart.vaciar();
        this.procesando.set(false);
        this.exito.set(true);
      },
      error: (err) => {
        this.procesando.set(false);
        const fieldMsg = primerErrorCampos(err?.error?.fields);
        if (fieldMsg) {
          this.error.set(fieldMsg);
          if (err?.error?.fields) {
            this.erroresCampo.set(err.error.fields);
          }
          return;
        }
        const msg = err?.error?.message ?? err?.error?.mensaje;
        this.error.set(typeof msg === 'string' ? msg : 'Hubo un problema al procesar la compra. Intenta de nuevo.');
      },
    });
  }

  errorCampo(nombre: string): string | null {
    return this.erroresCampo()[nombre] ?? null;
  }
}
