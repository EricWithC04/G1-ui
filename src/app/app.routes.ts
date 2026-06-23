import { Routes } from '@angular/router';

// Layouts (marcos) de cada zona del sitio.
import { StorefrontLayout } from './layouts/storefront-layout/storefront-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

// Guards (porteros) que controlan quien puede entrar a cada ruta.
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';

// --- Paginas de autenticacion (sin layout, pantalla completa) ---
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

// --- Paginas del PANEL ADMIN (las que ya existian) ---
import { Dashboard } from './pages/dashboard/dashboard';
import { ProductList } from './pages/product-list/product-list';
import { OrdenesCompra } from './pages/ordenes-compra/ordenes-compra';
import { CreateProduct } from './pages/create-product/create-product';
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
import { CategoriaLanding } from './pages/categoria-landing/categoria-landing';
import { PromoLanding } from './pages/promo-landing/promo-landing';
import { CrmClientes } from './pages/crm-clientes/crm-clientes';
import { CrmClienteFicha } from './pages/crm-cliente-ficha/crm-cliente-ficha';
import { CrmClienteNuevo } from './pages/crm-cliente-nuevo/crm-cliente-nuevo';
import { CrmLayout } from './layouts/crm-layout/crm-layout';
import { CrmBandeja } from './pages/crm-bandeja/crm-bandeja';
import { Configuracion } from './pages/configuracion/configuracion';
import { ConfigUsuarios } from './pages/configuracion/sections/config-usuarios/config-usuarios';
import { ConfigContabilidad } from './pages/configuracion/sections/config-contabilidad/config-contabilidad';
import { ConfigEmisores } from './pages/configuracion/sections/config-emisores/config-emisores';
import { ConfigPlantillas } from './pages/configuracion/sections/config-plantillas/config-plantillas';
import { ConfigIntegraciones } from './pages/configuracion/sections/config-integraciones/config-integraciones';
import { ConfigCatalogos } from './pages/configuracion/sections/config-catalogos/config-catalogos';
import { ConfigNotificaciones } from './pages/configuracion/sections/config-notificaciones/config-notificaciones';
import { ConfigSeguridad } from './pages/configuracion/sections/config-seguridad/config-seguridad';
import { ConfigAuditoria } from './pages/configuracion/sections/config-auditoria/config-auditoria';
import { ConfigLogs } from './pages/configuracion/sections/config-logs/config-logs';
import { permisoGuard } from './guards/permiso.guard';
import { Promociones } from './pages/promociones/promociones';
import { Campanas } from './pages/campanas/campanas';
import { Creditos } from './pages/creditos/creditos';
import { Facturacion } from './pages/facturacion/facturacion';
import { FacturaNueva } from './pages/factura-nueva/factura-nueva';
import { Presupuestos } from './pages/presupuestos/presupuestos';
import { PresupuestoForm } from './pages/presupuesto-form/presupuesto-form';
import { PresupuestoDetalle } from './pages/presupuesto-detalle/presupuesto-detalle';
import { Remitos } from './pages/remitos/remitos';
import { RemitoDetalle } from './pages/remito-detalle/remito-detalle';
import { PedidoNuevo } from './pages/pedido-nuevo/pedido-nuevo';
import { PosMostrador } from './pages/pos-mostrador/pos-mostrador';
import { ListasPrecios } from './pages/listas-precios/listas-precios';
import { PanelCliente } from './pages/panel-cliente/panel-cliente';

export const routes: Routes = [

    // --- Login y registro: pantallas sueltas, sin header ni footer ---
    { path: 'login', component: Login, canActivate: [guestGuard] },
    { path: 'register', component: Register, canActivate: [guestGuard] },

    // --- TIENDA (storefront): todo cuelga del layout de la tienda ---
    {
        path: '',
        component: StorefrontLayout,
        children: [
            { path: '', component: Catalogo },
            { path: 'producto/:id', component: ProductoDetalle },
            // Paginas de promos (banners del home)
            { path: 'hot-sale', component: PromoLanding },
            { path: 'cyber-week', component: PromoLanding },
            { path: 'panel-cliente', component: PanelCliente },
            // Paginas por categoria (banners del home)
            { path: 'categoria/:slug', component: CategoriaLanding },
            // Alias cortos para las categorias principales
            { path: 'notebooks', redirectTo: 'categoria/notebooks', pathMatch: 'full' },
            { path: 'perifericos', redirectTo: 'categoria/perifericos', pathMatch: 'full' },
            { path: 'monitores', redirectTo: 'categoria/monitores', pathMatch: 'full' },
            { path: 'componentes', redirectTo: 'categoria/componentes', pathMatch: 'full' },
            { path: 'almacenamiento', redirectTo: 'categoria/almacenamiento', pathMatch: 'full' },
            { path: 'audio', redirectTo: 'categoria/audio', pathMatch: 'full' },
            { path: 'sillas-gamer', redirectTo: 'categoria/sillas-gamer', pathMatch: 'full' },
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
            { path: '', component: Dashboard },
            {
                path: 'crm',
                component: CrmLayout,
                children: [
                    { path: '', redirectTo: 'clientes', pathMatch: 'full' },
                    { path: 'clientes', component: CrmClientes },
                    { path: 'nuevo', component: CrmClienteNuevo, canActivate: [permisoGuard('clientes.create')] },
                    { path: 'clientes/:id', component: CrmClienteFicha },
                    { path: 'inbox', component: CrmBandeja, canActivate: [permisoGuard('crm.read')] },
                    { path: 'bandeja', redirectTo: 'inbox', pathMatch: 'full' },
                ],
            },
            {
                path: 'configuracion',
                children: [
                    { path: '', component: Configuracion },
                    { path: 'usuarios', component: ConfigUsuarios, canActivate: [permisoGuard('usuarios.read')] },
                    { path: 'contabilidad', component: ConfigContabilidad, canActivate: [permisoGuard('config.manage_accounting')] },
                    { path: 'emisores', component: ConfigEmisores, canActivate: [permisoGuard('emisores.read')] },
                    { path: 'plantillas', component: ConfigPlantillas, canActivate: [permisoGuard('config.manage_billing_templates')] },
                    { path: 'integraciones', component: ConfigIntegraciones, canActivate: [permisoGuard('config.manage_integrations')] },
                    { path: 'catalogos', component: ConfigCatalogos, canActivate: [permisoGuard('config.update')] },
                    { path: 'notificaciones', component: ConfigNotificaciones, canActivate: [permisoGuard('config.update')] },
                    { path: 'seguridad', component: ConfigSeguridad, canActivate: [permisoGuard('config.update')] },
                    { path: 'auditoria', component: ConfigAuditoria, canActivate: [permisoGuard('auditoria.read')] },
                    { path: 'logs', component: ConfigLogs, canActivate: [permisoGuard('logs.read')] },
                ],
            },
            { path: 'promociones', component: Promociones },
            { path: 'campanas', component: Campanas },
            { path: 'facturacion', component: Facturacion, canActivate: [permisoGuard('facturacion.read')] },
            { path: 'facturacion/nueva', component: FacturaNueva, canActivate: [permisoGuard('facturacion.create')] },
            { path: 'presupuestos', component: Presupuestos, canActivate: [permisoGuard('facturacion.read')] },
            { path: 'presupuestos/nuevo', component: PresupuestoForm, canActivate: [permisoGuard('facturacion.create')] },
            { path: 'presupuestos/:id/editar', component: PresupuestoForm, canActivate: [permisoGuard('facturacion.create')] },
            { path: 'presupuestos/:id', component: PresupuestoDetalle, canActivate: [permisoGuard('facturacion.read')] },
            { path: 'remitos', component: Remitos, canActivate: [permisoGuard('envios.read')] },
            { path: 'remitos/:id', component: RemitoDetalle, canActivate: [permisoGuard('envios.read')] },
            { path: 'creditos', component: Creditos },
            { path: 'productos', component: ProductList, canActivate: [permisoGuard('productos.read')] },
            { path: 'listas-precios', component: ListasPrecios, canActivate: [permisoGuard('productos.read')] },
            { path: 'ordenes-compra', component: OrdenesCompra, canActivate: [permisoGuard('productos.read')] },
            { path: 'productos/nuevo', component: CreateProduct, canActivate: [permisoGuard('productos.create')] },
            { path: 'productos/:id/editar', component: CreateProduct, canActivate: [permisoGuard('productos.update')] },
            { path: 'pedidos', component: Pedidos, canActivate: [permisoGuard('pedidos.read')] },
            { path: 'pedidos/nuevo', component: PedidoNuevo, canActivate: [permisoGuard('pedidos.create')] },
            { path: 'pos', component: PosMostrador, canActivate: [permisoGuard('pedidos.create')] },
            { path: 'ventas/mostrador', redirectTo: 'pos', pathMatch: 'full' },
            { path: 'pagos', component: Pagos, canActivate: [permisoGuard('pagos.read')] },
            { path: 'planes', component: Planes },
            { path: 'envios', component: Envios, canActivate: [permisoGuard('envios.read')] },
            // Redirecciones: módulos movidos al hub Configuración o CRM
            { path: 'usuarios', redirectTo: 'configuracion/usuarios', pathMatch: 'full' },
            { path: 'categorias', redirectTo: 'configuracion/catalogos', pathMatch: 'full' },
            { path: 'perfiles', redirectTo: 'crm/clientes', pathMatch: 'full' },
        ],
    },

    // Si la URL no coincide con nada, volvemos al catalogo de la tienda.
    { path: '**', redirectTo: '' },
];
