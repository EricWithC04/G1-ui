import { Routes } from '@angular/router';

// Layouts (marcos) de cada zona del sitio.
import { StorefrontLayout } from './layouts/storefront-layout/storefront-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

// Guards (porteros) que controlan quien puede entrar a cada ruta.
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// --- Paginas de autenticacion (sin layout, pantalla completa) ---
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

// --- Paginas del PANEL ADMIN (las que ya existian) ---
import { Dashboard } from './pages/dashboard/dashboard';
import { ProductList } from './pages/product-list/product-list';
import { CreateProduct } from './pages/create-product/create-product';
import { Categorias } from './pages/categorias/categorias';
import { Usuarios } from './pages/usuarios/usuarios';
import { Perfiles } from './pages/perfiles/perfiles';
import { Pedidos } from './pages/pedidos/pedidos';
import { Pagos } from './pages/pagos/pagos';
import { Planes } from './pages/planes/planes';
import { Envios } from './pages/envios/envios';
import { Catalogo } from './pages/catalogo/catalogo';
import { ProductoDetalle } from './pages/producto-detalle/producto-detalle';
import { CarritoCompra } from './pages/carrito-compra/carrito-compra';
import { Checkout } from './pages/checkout/checkout';
import { MisPedidos } from './pages/mis-pedidos/mis-pedidos';
import { PerfilCliente } from './pages/perfil-cliente/perfil-cliente';
import { SeguimientoEnvio } from './pages/seguimiento-envio/seguimiento-envio';

export const routes: Routes = [

    // --- Login y registro: pantallas sueltas, sin header ni footer ---
    { path: 'login', component: Login },
    { path: 'register', component: Register },

    // --- TIENDA (storefront): todo cuelga del layout de la tienda ---
    {
        path: '',
        component: StorefrontLayout,
        children: [
            { path: '', component: Catalogo },                  // home / catalogo de productos
            { path: 'producto/:id', component: ProductoDetalle }, // detalle + resenas
            // Las siguientes necesitan estar logueado (authGuard):
            { path: 'seguimiento-envio/:id', component: SeguimientoEnvio, canActivate: [authGuard] },
            { path: 'carrito', component: CarritoCompra, canActivate: [authGuard] },
            { path: 'checkout', component: Checkout, canActivate: [authGuard] },
            { path: 'mis-pedidos', component: MisPedidos, canActivate: [authGuard] },
            { path: 'perfil', component: PerfilCliente, canActivate: [authGuard] },
        ],
    },
    
    // --- PANEL ADMIN: todo cuelga de /admin y solo entran los ADMIN (adminGuard) ---
    {
        path: 'admin',
        component: AdminLayout,
        canActivate: [adminGuard],
        children: [
            { path: '', component: Dashboard },                       // inicio del panel
            { path: 'productos', component: ProductList },            // lista de productos
            { path: 'productos/nuevo', component: CreateProduct },    // crear producto
            { path: 'productos/:id/editar', component: CreateProduct }, // editar producto
            { path: 'categorias', component: Categorias },
            { path: 'usuarios', component: Usuarios },
            { path: 'perfiles', component: Perfiles },
            { path: 'pedidos', component: Pedidos },
            { path: 'pagos', component: Pagos },
            { path: 'planes', component: Planes },
            { path: 'envios', component: Envios },
        ],
    },

    // Si la URL no coincide con nada, volvemos al catalogo de la tienda.
    { path: '**', redirectTo: '' },
];
