// ============================================================
//  MODELOS (interfaces) de toda la tienda Novatech.
//  Una "interface" en TypeScript describe que forma tiene un objeto:
//  que propiedades tiene y de que tipo es cada una.
//  Estos modelos reflejan EXACTAMENTE lo que devuelve y espera el backend.
//  El backend usa nombres en espanol y en formato camelCase (idProducto, etc.).
//  El signo "?" significa que esa propiedad es opcional (puede no venir).
// ============================================================

// Una categoria de productos (ej: Notebooks, Perifericos).
/**
 * Modelos TypeScript: interfaces que reflejan entidades/DTOs del backend.
 */
export interface Categoria {
    idCategoria?: number; // lo genera el backend al crear
    nombre?: string;
    descripcion?: string;
}

// Un producto que vendemos.
export interface Product {
    idProducto?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    precioLista?: number;
    stock: number;
    stockMinimo?: number;
    proveedor: string;
    categoria: Categoria;
    imagen?: string;
    /** Precio según lista/canal (viene del backend cuando se pide con ?canal= o ?listaPrecio=). */
    precioCanal?: number;
    listaPrecioCodigo?: string;
}

// Un usuario del sistema (puede ser ADMIN o CLIENTE).
export interface Usuario {
    idUsuario?: number;
    nombre: string;
    email: string;
    contrasena?: string; // solo se manda al crear o al cambiarla
    rol: string;         // "ADMIN" o "CLIENTE"
    fechaRegistro?: string; // la pone el backend si no la mandamos
}

// Datos extra de un usuario que ademas es cliente.
export interface PerfilCliente {
    idCliente?: number;
    usuario: Usuario;
    direccion?: string;
    ciudad?: string;
    telefono?: string;
    cuit?: string;
    contacto?: string;
    historialCrediticio?: number;
    /** CONSUMIDOR_FINAL | EMPRESA | CORPORATIVO | MAYORISTA | INSTITUCION_EDUCATIVA | OTRO */
    tipoCliente?: string;
    /** RESPONSABLE_INSCRIPTO | MONOTRIBUTO | EXENTO | SUJETO_EXENTO | CONSUMIDOR_FINAL | IVA_NO_ALCANZADO */
    condicionIva?: string;
    condicionPago?: string;
    limiteCredito?: number;
    segmento?: string;
    sitioWeb?: string;
    notas?: string;
    lat?: number;
    lng?: number;
    activo?: boolean;
    creadoEn?: string;
}

export interface ClienteMetricas {
    totalComprado?: number;
    cantidadCompras?: number;
    ticketPromedio?: number;
    primeraCompra?: string;
    ultimaCompra?: string;
    diasDesdeUltimaCompra?: number;
    frecuenciaMediaDias?: number;
    enRiesgo?: boolean;
    saldoActual?: number;
    deudaVencida?: number;
    aging?: Record<string, number>;
    scorePago?: number;
    semaforoPago?: 'VERDE' | 'AMARILLO' | 'ROJO';
    limiteCredito?: number;
    segmento?: string;
}

export interface ClienteHistorial {
    pedidos?: { idPedido?: number; fecha?: string; estado?: string; total?: number }[];
    productosFacturados?: { descripcion?: string; cantidad?: number; monto?: number }[];
}

// El carrito de compras de un usuario.
export interface Carrito {
    idCarrito?: number;
    usuario: Usuario;            // dueno del carrito (alcanza { idUsuario: n })
    fechaCreacion?: string;      // la pone el backend si no la mandamos
}

// Cada renglon del carrito: que producto y cuantas unidades.
export interface DetalleCarrito {
    idDetalleCarrito?: number;
    carrito: Carrito;            // a que carrito pertenece (alcanza { idCarrito: n })
    producto: Product;           // que producto (alcanza { idProducto: n })
    cantidad: number;
}

// Un pedido (una compra confirmada por un usuario).
export interface Pedido {
    idPedido?: number;
    usuario: Usuario;            // quien hizo el pedido (alcanza { idUsuario: n })
    fecha?: string;              // la pone el backend si no la mandamos
    estado?: string;            // "PENDIENTE", "PAGADO", "ENVIADO"...
    total: number;
    canalOrigen?: string;       // WEB | ADMIN | WHATSAPP | EMAIL | INSTAGRAM | FACEBOOK | POS
    tipoEntrega?: string;       // ENVIO | RETIRO_TIENDA
    notas?: string;
}

// Cada renglon de un pedido: producto, cantidad y precio del momento.
export interface DetallePedido {
    idDetalle?: number;
    pedido: Pedido;              // a que pedido pertenece (alcanza { idPedido: n })
    producto: Product;           // que producto (alcanza { idProducto: n })
    cantidad: number;
    precioUnitario: number;
}

// Un pago realizado para un pedido.
export interface Pago {
    idPago?: number;
    pedido: Pedido;              // que pedido se pago (alcanza { idPedido: n })
    fechaPago?: string;          // la pone el backend si no la mandamos
    monto: number;
    // Metodo: "TARJETA", "EFECTIVO", "TRANSFERENCIA", "MERCADO_PAGO",
    // "BILLETERA_VIRTUAL", "QR", "PRESTAMO_CASA".
    metodo: string;
    proveedorBilletera?: string; // nombre de la billetera (solo BILLETERA_VIRTUAL)
    referencia?: string;         // id/transaccion simulada
    estado?: string;             // "APROBADO" o "PENDIENTE"
    aprobadoPor?: Usuario;       // que admin lo aprobo (alcanza { idUsuario: n })
}

// Un plan de pago en cuotas de un pedido.
export interface PlanCuotas {
    idPlan?: number;
    cliente: PerfilCliente;      // a que cliente (alcanza { idCliente: n })
    pedido: Pedido;              // de que pedido (alcanza { idPedido: n })
    cantidadCuotas: number;
    interes: number;
    estado?: string;            // "ACTIVO", "FINALIZADO", "CANCELADO"
}

// El envio de un pedido.
export interface Envio {
    idEnvio?: number;
    pedido: Pedido;              // que pedido se envia (alcanza { idPedido: n })
    direccionEnvio: string;
    empresaLogistica: string;
    estadoEnvio?: string;       // "PREPARANDO", "EN_CAMINO", "ENTREGADO"
    numeroTracking?: string;
    fechaDespacho?: string;
    costoEnvio?: number;
}

export interface EnvioDetalleResponse {
    envio: Envio;
    pedido?: Pedido;
    clienteNombre?: string;
    clienteEmail?: string;
    lineas?: DetallePedido[];
    pagos?: Pago[];
    factura?: Factura;
    saldoPendiente?: number;
}

// Linea para confirmar una orden de venta.
export interface ConfirmarOrdenLinea {
    idProducto: number;
    cantidad: number;
}

// Request para confirmar una orden (checkout atomico).
export interface ConfirmarOrdenRequest {
    idUsuario: number;
    lineas: ConfirmarOrdenLinea[];
    metodoPago: string;
    tipoEntrega?: string;
    canalOrigen?: string;
    direccionEnvio?: string;
    empresaLogistica?: string;
    notas?: string;
    proveedorBilletera?: string;
    referencia?: string;
    cantidadCuotas?: number;
    interes?: number;
}

// Respuesta de confirmar orden.
export interface ConfirmarOrdenResponse {
    pedido: Pedido;
    pago: Pago;
    envio?: Envio;
    planCuotas?: PlanCuotas;
}

// Detalle enriquecido de un pedido (admin / mis pedidos).
export interface PedidoDetalleResponse {
    pedido: Pedido;
    detalles: DetallePedido[];
    pagos: Pago[];
    envio?: Envio;
    planCuotas?: PlanCuotas;
    saldoPendiente?: number;
    idFactura?: number;
}

// Una resena/opinion que un usuario deja sobre un producto.
export interface Resena {
    idResena?: number;
    producto: Product;           // de que producto es la resena (alcanza { idProducto: n })
    usuario: Usuario;            // quien la escribio (alcanza { idUsuario: n })
    comentario?: string;
    puntuacion: number;          // del 1 al 5
    fecha?: string;              // la pone el backend si no la mandamos
}

// --- Modulos CRM / ERP / Facturacion ---

export interface Promocion {
    idPromocion?: number;
    titulo: string;
    descripcion?: string;
    porcentajeDescuento?: number;
    codigo?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: string;             // BORRADOR, ACTIVA, FINALIZADA
    segmentoObjetivo?: string;   // TODOS, MINORISTA, MAYORISTA, CON_DEUDA
}

export interface Campana {
    idCampana?: number;
    nombre: string;
    tipo?: string;               // PROMOCION, RECORDATORIO_PAGO, CUOTA_VENCIDA, NOVEDAD
    promocion?: Promocion;
    asunto?: string;
    cuerpoMensaje?: string;
    canal?: string;              // EMAIL, SMS, AMBOS
    estado?: string;             // BORRADOR, PROGRAMADA, ENVIADA, CANCELADA
    segmento?: string;
    fechaProgramada?: string;
    fechaEnvio?: string;
    cantidadEnviados?: number;
}

export interface MensajeCliente {
    idMensaje?: number;
    campana?: Campana;
    usuario?: Usuario;
    emailDestino?: string;
    telefonoDestino?: string;
    estado?: string;
    fechaEnvio?: string;
    detalle?: string;
}

export interface Cuota {
    idCuota?: number;
    plan?: PlanCuotas;
    numeroCuota?: number;
    monto?: number;
    fechaVencimiento?: string;
    fechaPago?: string;
    estado?: string;
    idPlan?: number;
    idPedido?: number;
    clienteNombre?: string;
    clienteEmail?: string;
}

export interface CuotaClienteItem {
    idCuota?: number;
    numeroCuota?: number;
    monto?: number;
    fechaVencimiento?: string;
    fechaPago?: string;
    estado?: string;
}

export interface PrestamoCliente {
    idPlan?: number;
    idPedido?: number;
    cantidadCuotas?: number;
    interes?: number;
    estadoPlan?: string;
    totalFinanciado?: number;
    cuotasPagadas?: number;
    cuotaActual?: number;
    idCuotaActual?: number;
    saldoPendiente?: number;
    montoProximaCuota?: number;
    vencimientoProximaCuota?: string;
    cuotas?: CuotaClienteItem[];
}

export interface Factura {
    idFactura?: number;
    pedido?: Pedido;
    presupuesto?: Presupuesto;
    remito?: Remito;
    numeroFactura?: string;
    puntoVenta?: number;
    fechaEmision?: string;
    subtotal?: number;
    iva?: number;
    total?: number;
    estado?: string;             // BORRADOR, EMITIDA, ANULADA
    tipoComprobante?: string;
    cuitCliente?: string;
    condicionIvaCliente?: string;
    cae?: string;
    caeVencimiento?: string;
    notas?: string;
    formaCobro?: string;
    cantidadCuotas?: number;
    lineas?: DetalleFactura[];
}

export interface LineaComprobante {
    idProducto: number;
    cantidad: number;
    precioUnitario?: number;
    descuentoPorcentaje?: number;
    descripcion?: string;
}

export interface DetalleComprobanteBase {
    idDetalle?: number;
    producto?: Product;
    cantidad?: number;
    precioUnitario?: number;
    descuentoPorcentaje?: number;
    subtotal?: number;
    descripcion?: string;
}

export interface DetallePresupuesto extends DetalleComprobanteBase {}

export interface DetalleRemito {
    idDetalle?: number;
    producto?: Product;
    cantidad?: number;
    descripcion?: string;
}

export interface DetalleFactura extends DetalleComprobanteBase {}

export interface Presupuesto {
    idPresupuesto?: number;
    numeroPresupuesto?: string;
    cliente?: PerfilCliente;
    fecha?: string;
    validezHasta?: string;
    estado?: string;             // BORRADOR, ENVIADO, APROBADO, VENCIDO, FACTURADO
    subtotal?: number;
    iva?: number;
    total?: number;
    notas?: string;
    lineas?: DetallePresupuesto[];
}

export interface PresupuestoRequest {
    idCliente: number;
    validezHasta?: string;
    notas?: string;
    lineas: LineaComprobante[];
}

export interface Remito {
    idRemito?: number;
    numeroRemito?: string;
    pedido?: Pedido;
    presupuesto?: Presupuesto;
    cliente?: PerfilCliente;
    fecha?: string;
    estado?: string;             // PREPARADO, DESPACHADO, ENTREGADO
    direccionEntrega?: string;
    notas?: string;
    lineas?: DetalleRemito[];
}

export interface RemitoRequest {
    idCliente?: number;
    pedidoId?: number;
    presupuestoId?: number;
    direccionEntrega?: string;
    notas?: string;
    lineas: LineaComprobante[];
}

export interface GenerarFacturaRequest {
    pedidoId?: number;
    presupuestoId?: number;
    remitoId?: number;
    clienteId?: number;
    lineas?: LineaComprobante[];
    notas?: string;
    puntoVenta?: number;
    tipoComprobante?: string;
    formaCobro?: string;
    cantidadCuotas?: number;
    interes?: number;
}

export interface InteraccionCrm {
    idInteraccion?: number;
    cliente?: PerfilCliente;
    tipo?: string;
    titulo?: string;
    descripcion?: string;
    fecha?: string;
    prioridad?: string;
    estado?: string;
}

export interface CrmResumen {
    clientesActivos: number;
    promocionesActivas: number;
    campanasPendientes: number;
    cuotasVencidas: number;
    cuotasPorVencer: number;
    facturasEmitidas: number;
    interaccionesAbiertas: number;
    mensajesEnviadosMes: number;
}

export interface EstadoCantidad {
    estado: string;
    cantidad: number;
    porcentaje: number;
}

export interface PedidoReciente {
    idPedido?: number;
    clienteNombre?: string;
    total?: number;
    estado?: string;
    fecha?: string;
}

export interface FacturaReciente {
    idFactura?: number;
    numeroFactura?: string;
    idPedido?: number;
    clienteNombre?: string;
    total?: number;
    estado?: string;
    fechaEmision?: string;
}

export interface DashboardKpi {
    ventasTotales: number;
    ventasMes: number;
    ventasHoy: number;
    pedidosTotal: number;
    pedidosMes: number;
    pedidosHoy: number;
    pedidosPendientes: number;
    pedidosPagados: number;
    ticketPromedio: number;
    facturadoTotal: number;
    facturadoMes: number;
    ivaMes: number;
    facturasEmitidas: number;
    facturasAnuladas: number;
    cobradoTotal: number;
    cobradoMes: number;
    pagosRegistrados: number;
    pagosPendientesAprobar: number;
    carteraPendiente: number;
    productosTotal: number;
    productosBajoStock: number;
    clientesActivos: number;
    cuotasVencidas: number;
    cuotasPorVencer: number;
    promocionesActivas: number;
    campanasPendientes: number;
    crmPendientes: number;
    pedidosPorEstado: EstadoCantidad[];
    ultimosPedidos: PedidoReciente[];
    ultimasFacturas: FacturaReciente[];
}

export interface DetalleOrdenCompra {
    idDetalle?: number;
    producto?: Product;
    cantidad?: number;
    precioUnitario?: number;
    subtotal?: number;
}

export interface OrdenCompra {
    idOrden?: number;
    fecha?: string;
    estado?: string;
    proveedor?: string;
    total?: number;
    notas?: string;
    detalles?: DetalleOrdenCompra[];
}

// --- CRM Omnicanal ---

export interface Conversacion {
    idConversacion?: number;
    canal?: string;
    contactoNombre?: string;
    contactoEmail?: string;
    contactoTelefono?: string;
    asunto?: string;
    vistaPrevia?: string;
    estado?: string;
    cliente?: PerfilCliente;
    asignadoA?: Usuario;
    etiquetas?: string;
    fechaCreacion?: string;
    ultimaActividad?: string;
    pedido?: Pedido;
}

export interface MensajeConversacion {
    idMensaje?: number;
    direccion?: string;
    remitenteNombre?: string;
    cuerpo?: string;
    fecha?: string;
}

export interface SolicitudDevolucion {
    idSolicitud?: number;
    pedido?: Pedido;
    cliente?: PerfilCliente;
    motivo?: string;
    estado?: string;
    descripcion?: string;
    lineasJson?: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
}

export interface IntegracionCanal {
    idIntegracion?: number;
    tipo?: string;
    nombre?: string;
    activo?: boolean;
    estadoConexion?: string;
    configJson?: string;
}

export interface ConfiguracionSistema {
    idConfig?: number;
    grupo?: string;
    clave?: string;
    valor?: string;
    descripcion?: string;
}

export interface RegistroAuditoria {
    idRegistro?: number;
    fecha?: string;
    usuarioNombre?: string;
    modulo?: string;
    accion?: string;
    detalle?: string;
    entidad?: string;
    entidadId?: string;
    ip?: string;
    datosAntes?: string;
    datosDespues?: string;
}

export interface LogSistema {
    idLog?: number;
    fecha?: string;
    nivel?: string;
    origen?: string;
    mensaje?: string;
    usuarioNombre?: string;
    stackTrace?: string;
    metadataJson?: string;
}

export interface Emisor {
    idEmisor?: number;
    razonSocial?: string;
    cuit?: string;
    /** RESPONSABLE_INSCRIPTO | MONOTRIBUTO | EXENTO | SUJETO_EXENTO | CONSUMIDOR_FINAL | IVA_NO_ALCANZADO */
    condicionIva?: string;
    iibb?: string;
    domicilio?: string;
    puntoVenta?: number;
    ambiente?: string;
    esDefault?: boolean;
    certificadoNombre?: string;
    certificadoVencimiento?: string;
}

export interface PlantillaImpresion {
    idPlantilla?: number;
    tipo?: string;
    nombre?: string;
    contenidoJson?: string;
    esDefault?: boolean;
    activo?: boolean;
}

export interface CatalogoMaestro {
    idCatalogo?: number;
    tipo?: string;
    codigo?: string;
    nombre?: string;
    datosJson?: string;
    orden?: number;
    activo?: boolean;
}

export interface PermisoRbac {
    idPermiso?: number;
    clave?: string;
    modulo?: string;
    descripcion?: string;
}

export interface RolRbac {
    idRol?: number;
    clave?: string;
    nombre?: string;
    descripcion?: string;
    esSistema?: boolean;
    accesoTotal?: boolean;
    accesoPanel?: boolean;
}

/** Lista de precios por canal/segmento (mayorista, B2B, e-commerce, local). */
export interface ListaPrecio {
    idListaPrecio?: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    descuentoGlobal: number;
    activo?: boolean;
    detalles?: ListaPrecioDetalle[];
}

export interface ListaPrecioDetalle {
    idDetalle?: number;
    listaPrecio?: ListaPrecio;
    producto: Product;
    descuentoPorcentaje?: number;
    precioFijo?: number;
}

export interface ListaPrecioUpdate {
    nombre?: string;
    descripcion?: string;
    descuentoGlobal?: number;
    activo?: boolean;
}

export interface PrecioResuelto {
    idProducto: number;
    codigoLista: string;
    nombreLista: string;
    precioBase: number;
    descuentoGlobal: number;
    descuentoUnitario?: number;
    precioFijo?: number;
    descuentoEfectivoPorcentaje: number;
    precioEfectivo: number;
    usaPrecioFijo: boolean;
    usaDescuentoUnitario: boolean;
}
