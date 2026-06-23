import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { Pedido } from '../../models/models';

// Una etapa del seguimiento del envio (ej: "Pedido confirmado", "En camino", etc).
interface EtapaEnvio {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string | null; // fecha/hora en que se completo, o null si todavia no llego a esa etapa
}

// Item de prueba del pedido (mismo shape que usa el resumen del checkout).
interface ItemPedidoMock {
  nombre: string;
  cantidad: number;
  precio: number;
}

// Datos de prueba de un pedido completo, simulando lo que despues
// vendria del backend (Pedido + Envio + DetallePedido).
interface PedidoSeguimientoMock {
  numeroPedido: number;
  fecha: string;
  direccionEnvio: string;
  empresaLogistica: string;
  numeroSeguimiento: string;
  fechaEstimada: string;
  items: ItemPedidoMock[];
  total: number;
  etapaActualId: string;
}

// Pagina de SEGUIMIENTO DE ENVIO. Muestra en que etapa esta el pedido
// (confirmado -> preparacion -> enviado -> en camino -> entregado), junto
// con los datos de envio y un resumen de los productos.
//
// IMPORTANTE: por ahora todo son DATOS DE PRUEBA (mock), generados con un
// pequenio delay para simular la llamada al backend, igual que se hace en
// el checkout con el pago de Mercado Pago. Cuando exista un endpoint real
// de seguimiento (por ejemplo en EnvioService), esta pantalla deberia
// reemplazar generarPedidoMock() por la llamada correspondiente usando el
// idPedido que venga por la ruta (ActivatedRoute).
@Component({
  selector: 'app-seguimiento-envio',
  imports: [RouterLink, DecimalPipe, NgClass],
  templateUrl: './seguimiento-envio.html',
})
export class SeguimientoEnvio implements OnInit {

  // Definicion fija de las etapas posibles de un envio, en orden.
  // "fecha" se completa recien cuando el pedido (mock) llega a esa etapa.
  private etapasBase: Omit<EtapaEnvio, 'fecha'>[] = [
    { id: 'CONFIRMADO', nombre: 'Pedido confirmado', descripcion: 'Recibimos tu pedido y el pago fue aprobado.' },
    { id: 'PREPARACION', nombre: 'En preparacion', descripcion: 'Estamos preparando tus productos en el deposito.' },
    { id: 'ENVIADO', nombre: 'Enviado', descripcion: 'Tu pedido salio del deposito hacia la empresa de logistica.' },
    { id: 'EN_CAMINO', nombre: 'En camino', descripcion: 'El pedido esta en camino a tu domicilio.' },
    { id: 'ENTREGADO', nombre: 'Entregado', descripcion: 'Tu pedido fue entregado con exito.' },
  ];

  // Mientras esta en true mostramos un estado de carga.
  cargando = signal(true);

  // El pedido de prueba que se "trae" desde el backend (simulado).
  pedido = signal<PedidoSeguimientoMock | null>(null);

  // Etapas ya armadas con su fecha (o null) segun la etapaActualId del pedido.
  etapas = computed<EtapaEnvio[]>(() => {
    const p = this.pedido();
    if (!p) return [];

    const indiceActual = this.etapasBase.findIndex(e => e.id === p.etapaActualId);

    return this.etapasBase.map((etapa, i) => ({
      ...etapa,
      // Las etapas anteriores o igual a la actual ya tienen fecha (simulada).
      fecha: i <= indiceActual ? this.fechaSimulada(i) : null,
    }));
  });

  // Indice (0-based) de la etapa actual dentro de etapasBase.
  indiceEtapaActual = computed(() => {
    const p = this.pedido();
    if (!p) return 0;
    return Math.max(0, this.etapasBase.findIndex(e => e.id === p.etapaActualId));
  });

  // Porcentaje de avance para la barra de progreso de arriba.
  progreso = computed(() => {
    const total = this.etapasBase.length - 1;
    if (total <= 0) return 0;
    return Math.round((this.indiceEtapaActual() / total) * 100);
  });

  // True cuando el pedido ya llego a la ultima etapa (entregado).
  entregado = computed(() => this.pedido()?.etapaActualId === 'ENTREGADO');

  pedidoSeleccionado = signal<Pedido | null>(null)

  constructor (
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
  ) {}

  ngOnInit(): void {
    // TODO INTEGRACION REAL: aca iria algo como
    //   this.envioService.obtenerSeguimiento(idPedido).subscribe(...)
    // usando el idPedido que venga de la ruta. Por ahora generamos datos
    // de prueba con un pequenio delay, igual que se simula el pago de
    // Mercado Pago en el checkout.
    const pedidoId = Number(this.route.snapshot.paramMap.get('id'));

    this.pedidoService.obtener(pedidoId).subscribe(pedido => {
        this.pedidoSeleccionado.set(pedido);
        setTimeout(() => {
          this.pedido.set(this.generarPedidoMock(new Date(pedido.fecha!)));
          this.cargando.set(false);
        }, 600);
    })
  }

  // Arma una fecha de ejemplo para una etapa, contando dias hacia atras
  // desde hoy segun que tan "vieja" es la etapa.
  private fechaSimulada(indiceEtapa: number): string {
    const diasAtras = (this.etapasBase.length - 1) - indiceEtapa;
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasAtras);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  // Datos de prueba de un pedido en camino, con sus productos.
  private generarPedidoMock(fecha: Date): PedidoSeguimientoMock {
    return {
      numeroPedido: 1042,
      fecha: `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`,
      direccionEnvio: 'Av. Siempre Viva 742, Formosa',
      empresaLogistica: 'Andreani',
      numeroSeguimiento: 'AND-583920174AR',
      fechaEstimada: this.calcularFechaEstimada(),
      items: [
        { nombre: 'Mouse inalambrico NovaTech X1', cantidad: 1, precio: 15999 },
        { nombre: 'Teclado mecanico RGB', cantidad: 1, precio: 42999 },
        { nombre: 'Auriculares Bluetooth Pro', cantidad: 2, precio: 28999 },
      ],
      total: 116996,
      etapaActualId: 'CONFIRMADO',
    };
  }

  private calcularFechaEstimada(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 2);
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'long' });
  }
}