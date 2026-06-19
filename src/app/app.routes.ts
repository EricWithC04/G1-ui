// import { Routes } from '@angular/router';
// import { ProductList } from './pages/product-list/product-list'
// import { CreateProduct } from './pages/create-product/create-product';

import { Routes } from '@angular/router';

// Layouts (marcos) de cada zona del sitio.
// import { StorefrontLayout } from './layouts/storefront-layout/storefront-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

// Guards (porteros) que controlan quien puede entrar a cada ruta.
// import { authGuard } from './guards/auth.guard';
// import { adminGuard } from './guards/admin.guard';

// --- Paginas de autenticacion (sin layout, pantalla completa) ---
import { Login } from './pages/login/login';

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

export const routes: Routes = [

    // --- Login y registro: pantallas sueltas, sin header ni footer ---
    { path: 'login', component: Login },
    
    // --- PANEL ADMIN: todo cuelga de /admin y solo entran los ADMIN (adminGuard) ---
    {
        path: 'admin',
        component: AdminLayout,
        // canActivate: [adminGuard],
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
