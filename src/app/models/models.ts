// ============================================================
//  MODELOS (interfaces) de toda la tienda Novatech.
//  Una "interface" en TypeScript describe que forma tiene un objeto:
//  que propiedades tiene y de que tipo es cada una.
//  Estos modelos reflejan EXACTAMENTE lo que devuelve y espera el backend.
//  El backend usa nombres en espanol y en formato camelCase (idProducto, etc.).
//  El signo "?" significa que esa propiedad es opcional (puede no venir).
// ============================================================

// Una categoria de productos (ej: Notebooks, Perifericos).
export interface Categoria {
    idCategoria?: number; // lo genera el backend al crear
    nombre?: string;
    descripcion?: string;
}

// Un producto que vendemos.
export interface Product {
    idProducto?: number; // lo genera el backend, no se manda al crear
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    proveedor: string;
    categoria: Categoria; // al crear/editar alcanza con { idCategoria: n }
    imagen?: string;      // foto del producto en base64 (data URL). Opcional.
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
    usuario: Usuario;            // a que usuario pertenece (alcanza { idUsuario: n })
    direccion?: string;
    telefono?: string;
    historialCrediticio?: number;
    tipoCliente?: string;        // "MINORISTA" o "MAYORISTA"
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
