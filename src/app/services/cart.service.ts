import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/models';

// ============================================================
//  Un item del carrito: que producto es y cuantas unidades lleva.
//  Guardamos una copia de los datos del producto que necesitamos
//  para mostrar el carrito (nombre, precio, etc.) sin volver a pedirlos.
// ============================================================
export interface ItemCarrito {
    producto: Product;
    cantidad: number;
}

// Clave con la que guardamos el carrito en el localStorage del navegador.
const CLAVE_STORAGE = 'novatech_carrito';

// ============================================================
//  CartService: maneja el carrito de compras EN EL CLIENTE.
//  El carrito NO se guarda en el backend: vive en el navegador
//  (localStorage) hasta que la persona confirma la compra (checkout).
// ============================================================
@Injectable({ providedIn: 'root' })
export class CartService {

    // signal con la lista de items del carrito. Arranca con lo que haya guardado.
    items = signal<ItemCarrito[]>(this.leerDeStorage());

    // computed = valor que se recalcula solo cuando cambian los items.
    // cantidadTotal: suma de todas las unidades (para el numerito del icono del carrito).
    cantidadTotal = computed(() =>
        this.items().reduce((suma, item) => suma + item.cantidad, 0)
    );

    // total en plata: suma de precio * cantidad de cada item.
    total = computed(() =>
        this.items().reduce((suma, item) => suma + Number(item.producto.precio) * item.cantidad, 0)
    );

    // Agrega un producto al carrito. Si ya estaba, le suma la cantidad.
    agregar(producto: Product, cantidad: number = 1): void {
        const actuales = [...this.items()];
        const i = actuales.findIndex(item => item.producto.idProducto === producto.idProducto);
        if (i >= 0) {
            // Ya estaba: aumentamos la cantidad.
            actuales[i] = { ...actuales[i], cantidad: actuales[i].cantidad + cantidad };
        } else {
            // No estaba: lo agregamos como item nuevo.
            actuales.push({ producto, cantidad });
        }
        this.actualizar(actuales);
    }

    // Cambia la cantidad de un producto. Si queda en 0 o menos, lo saca.
    cambiarCantidad(idProducto: number, cantidad: number): void {
        let actuales = this.items().map(item =>
            item.producto.idProducto === idProducto ? { ...item, cantidad } : item
        );
        // Sacamos los que quedaron en 0 o negativo.
        actuales = actuales.filter(item => item.cantidad > 0);
        this.actualizar(actuales);
    }

    // Quita por completo un producto del carrito.
    quitar(idProducto: number): void {
        this.actualizar(this.items().filter(item => item.producto.idProducto !== idProducto));
    }

    // Vacia el carrito (lo usamos al terminar la compra).
    vaciar(): void {
        this.actualizar([]);
    }

    // Guarda la nueva lista en el signal y en localStorage (asi no se pierde al recargar).
    private actualizar(items: ItemCarrito[]): void {
        this.items.set(items);
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
    }

    // Lee el carrito guardado al arrancar. Si no hay o esta roto, devuelve lista vacia.
    private leerDeStorage(): ItemCarrito[] {
        const texto = localStorage.getItem(CLAVE_STORAGE);
        if (!texto) {
            return [];
        }
        try {
            return JSON.parse(texto) as ItemCarrito[];
        } catch {
            return [];
        }
    }
}
