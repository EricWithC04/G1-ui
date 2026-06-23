# NovaTech Store — Frontend

Frontend del proyecto **NovaTech Store** (Grupo 1): la interfaz web del e-commerce.
Tiene **dos zonas**: la **tienda** (storefront, para clientes) y el **panel de
administración** (`/admin`, solo para ADMIN). Este documento explica todo lo que se
hizo para que cualquiera del equipo pueda **entenderlo, levantarlo y defenderlo**.

- **Stack:** Angular 22 (standalone components + **signals**) · TypeScript · Tailwind CSS 4
- **Íconos:** `@lucide/angular`
- **Conexión al backend:** `HttpClient` con **rutas relativas** + proxy del dev server
- **Estado de sesión y carrito:** `signals` + `localStorage`
- **Documentación ERP:** [../docs/README.md](../docs/README.md) · **[GUARDRAILS](../docs/GUARDRAILS.md)** · [AGENTS.md](./AGENTS.md)

---

## Repositorios del proyecto

| Parte | Repositorio | Rama habitual | URL |
|-------|-------------|---------------|-----|
| **Frontend (este repo)** | `EricWithC04/G1-ui` | `main` | https://github.com/EricWithC04/G1-ui |
| **Backend (API REST)** | `LeanMongelos/G1-ms` | `main` | https://github.com/LeanMongelos/G1-ms |

El frontend **no incluye** el backend. Para desarrollo local hay que clonar ambos repos y levantar el backend en `localhost:8080` antes de `npm start`.

**Rama `banners`:** incluye páginas de landing por categoría y promos (`/notebooks`, `/hot-sale`, `/cyber-week`, etc.), logo recortado, separación visual body/footer en la tienda y validación de nombres de categoría en el panel admin.

Más contexto para agentes y colaboradores: ver [`AGENTS.md`](./AGENTS.md) en la raíz del repo.

---

## 1. Índice

1. Índice
2. Qué hace este frontend
3. Cómo se conecta con el backend (rutas relativas + proxy)
4. Arquitectura y estructura de carpetas
5. Rutas y navegación (storefront vs admin)
6. Guards (control de acceso)
7. Servicios (cómo hablamos con la API)
8. Modelos de datos
9. Autenticación (login/registro/sesión)
10. Carrito de compras
11. Checkout y ecosistema de pagos
12. Fotos de productos
13. Cómo levantar el frontend
14. Cómo compartirlo por un túnel
15. Cómo defender este desarrollo (preguntas frecuentes)

---

## 2. Qué hace este frontend

**Tienda (clientes):**
- Catálogo de productos con búsqueda y filtro por categoría.
- Detalle de producto con **reseñas** (ver y, si estás logueado, dejar la tuya).
- **Carrito** de compras (con fotos), **checkout** con varios métodos de pago.
- **Mis pedidos** y **perfil** del cliente.
- **Login** y **registro**.

**Panel admin (`/admin`, solo ADMIN):**
- Dashboard y ABM de **productos** (con carga de foto), **categorías**, **usuarios**,
  **perfiles**, **pedidos**, **pagos**, **planes de cuotas** y **envíos**.

---

## 3. Cómo se conecta con el backend (rutas relativas + proxy)

Esta es una de las decisiones clave del proyecto, conviene tenerla clara.

- En `src/environments/environment.ts`, **`apiUrl` está vacío** a propósito. Por eso
  todas las llamadas salen como **rutas relativas**: `/productos`, `/auth/login`, etc.
- Al estar vacías, las peticiones van al **mismo origen** que sirve la app. El **dev
  server de Angular hace de proxy** hacia el backend (`localhost:8080`) según
  `proxy.conf.json`.

```
Navegador ──(/productos)──► dev server Angular (4200) ──proxy──► backend (8080)
```

**Ventajas:**
- **No hay problemas de CORS** (todo es mismo origen para el navegador).
- Funciona igual aunque se entre por un **túnel público** (Cloudflare), sin tocar nada.

`proxy.conf.json` lista cada ruta raíz de la API (`/auth`, `/productos`, `/categorias`,
`/usuarios`, `/perfiles`, `/carritos`, `/detalle-carritos`, `/pedidos`,
`/detalle-pedidos`, `/pagos`, `/planes`, `/envios`, `/resenas`, `/ping`) y la reenvía a
`http://localhost:8080`.

---

## 4. Arquitectura y estructura de carpetas

App **standalone** (sin NgModules), con componentes reactivos basados en **signals**.

```
src/app
├── app.routes.ts        # todas las rutas (storefront + admin + auth)
├── app.config.ts        # providers (HttpClient, router)
├── layouts/
│   ├── storefront-layout/  # marco de la tienda (header de tienda + contenido)
│   └── admin-layout/       # marco del panel admin (sidebar + contenido)
├── guards/
│   ├── auth.guard.ts       # exige estar logueado
│   └── admin.guard.ts      # exige rol ADMIN
├── services/
│   ├── api-base.ts         # BaseApiService<T> (CRUD genérico) + API_URL
│   ├── auth.service.ts     # login/registro/sesión
│   ├── cart.service.ts     # carrito en el navegador
│   └── *.service.ts        # uno por entidad (producto, categoria, pedido, pago, ...)
├── models/
│   └── models.ts           # interfaces de TODAS las entidades
├── utils/
│   └── qrcode.ts           # generador de QR (SVG) sin dependencias
├── components/             # header, store-header, sidebar, product-card
└── pages/                  # una carpeta por pantalla (.ts + .html)
```

**Patrón de servicios (importante):** casi todos los servicios extienden
`BaseApiService<T>`, que implementa el CRUD genérico (`listar`, `obtener`, `crear`,
`actualizar`, `eliminar`) contra `/{recurso}`. Cada servicio solo dice su recurso:
así no repetimos el mismo código de HTTP en cada entidad.

---

## 5. Rutas y navegación (storefront vs admin)

Definidas en `app.routes.ts`:

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/login`, `/register` | Login / Registro | Público (sin layout) |
| `/` | Catálogo (home de la tienda) | Público |
| `/producto/:id` | Detalle + reseñas | Público |
| `/carrito` | Carrito | Logueado (`authGuard`) |
| `/checkout` | Finalizar compra | Logueado (`authGuard`) |
| `/mis-pedidos` | Pedidos del cliente | Logueado (`authGuard`) |
| `/perfil` | Perfil del cliente | Logueado (`authGuard`) |
| `/admin` | Dashboard | ADMIN (`adminGuard`) |
| `/admin/productos` | Lista de productos | ADMIN |
| `/admin/productos/nuevo` | Crear producto | ADMIN |
| `/admin/productos/:id/editar` | Editar producto | ADMIN |
| `/admin/categorias`, `/usuarios`, `/perfiles`, `/pedidos`, `/pagos`, `/planes`, `/envios` | ABM de cada módulo | ADMIN |
| `**` | Redirige al catálogo | — |

La tienda cuelga de `StorefrontLayout` y el panel de `AdminLayout`, cada uno con su
propio header/sidebar.

---

## 6. Guards (control de acceso)

- **`authGuard`**: deja pasar solo si hay un usuario logueado; si no, redirige a `/login`.
- **`adminGuard`**: deja pasar solo si el usuario logueado tiene rol `ADMIN`.

Ambos consultan el `AuthService`. Es seguridad **de UI** (comodidad/navegación); la
validación real de permisos siempre debe estar en el backend.

---

## 7. Servicios (cómo hablamos con la API)

- `api-base.ts` → `BaseApiService<T>`: CRUD genérico. `API_URL` viene del environment
  (vacío = rutas relativas).
- `product.ts` → `ProductService`: además del CRUD, `listarConFiltros({nombre, categoriaId})`.
- `categoria.service.ts`, `usuario.service.ts`, `perfil.service.ts`, `carrito.service.ts`,
  `pedido.service.ts` (incluye `DetallePedidoService`), `pago.service.ts`,
  `plan-cuotas.service.ts`, `envio.service.ts`, `resena.service.ts`.
- `auth.service.ts` y `cart.service.ts` (ver secciones 9 y 10).

---

## 8. Modelos de datos

En `models/models.ts` están las interfaces que reflejan **exactamente** lo que espera
y devuelve el backend (nombres en español, `camelCase`): `Categoria`, `Product`,
`Usuario`, `PerfilCliente`, `Carrito`, `DetalleCarrito`, `Pedido`, `DetallePedido`,
`Pago`, `PlanCuotas`, `Envio`, `Resena`.

Detalles relevantes:
- `Product.imagen?: string` → foto en base64 (data URL).
- `Pago` incluye `proveedorBilletera?`, `referencia?`, `estado?` para el ecosistema de pagos.
- Para relacionar entidades alcanza con el id: `{ categoria: { idCategoria: 1 } }`.

---

## 9. Autenticación (login/registro/sesión)

`AuthService` maneja toda la sesión:

- `register(datos)` → `POST /auth/register`.
- `login(datos)` → `POST /auth/login`; si sale bien, **guarda el usuario**.
- El usuario logueado se guarda en un **`signal`** (`usuarioActual`) y en
  **`localStorage`** (clave `novatech_usuario`), así la sesión sobrevive a recargas.
- Helpers: `isLoggedIn()`, `getRol()`, `esAdmin()`, `getUsuario()`, `logout()`.

Como es un `signal`, cuando el usuario entra o sale, los componentes que lo usan
(header, guards, etc.) se actualizan solos.

> No usamos JWT: el backend devuelve los datos del usuario (sin contraseña) y el
> frontend los persiste. El `rol` decide el acceso al panel admin.

---

## 10. Carrito de compras

`CartService` mantiene el carrito **en el navegador** (no en el backend):

- `items` es un `signal<ItemCarrito[]>` (cada item = `{ producto, cantidad }`).
- `cantidadTotal` y `total` son `computed` (se recalculan solos).
- `agregar`, `cambiarCantidad`, `quitar`, `vaciar`.
- Se persiste en `localStorage` (clave `novatech_carrito`), así no se pierde al recargar.

El carrito recién se "materializa" en el backend al **confirmar la compra** (checkout).

---

## 11. Checkout y ecosistema de pagos

`pages/checkout` ofrece un selector de **7 métodos de pago**, cada uno con su sub-flujo:

| Método | Sub-flujo en la UI |
|---|---|
| **Tarjeta** | Form simulado (número, vencimiento, titular) |
| **Efectivo** | Sin pasos extra |
| **Transferencia** | Muestra CBU/alias de ejemplo |
| **Mercado Pago** | Botón "Pagar con Mercado Pago" → procesa y muestra "aprobado" (simulado) |
| **Billetera virtual** | Elegir billetera (MODO, Ualá, Naranja X, Personal Pay, Mercado Pago) |
| **QR** | Muestra un **QR generado** con el monto; botón "ya pagué" |
| **Préstamos de la casa** | Cuotas 3 (10%), 6 (20%), 12 (35%): calcula valor de cuota y total financiado |

Al confirmar (`confirmar()`), el frontend crea en el backend, en orden:
1. **Pedido** (`POST /pedidos`)
2. un **DetallePedido** por producto (`POST /detalle-pedidos`)
3. el **Pago** con el método y sus datos (`POST /pagos`)
4. el **Envío** (`POST /envios`)
5. si es préstamo, además un **PlanCuotas** (`POST /planes`)

Usa `forkJoin` para esperar a que todas las llamadas terminen, después vacía el carrito
y muestra la confirmación.

- **QR sin dependencias:** `utils/qrcode.ts` genera el `<svg>` del QR localmente
  (`generarQrSvg`), así no agregamos librerías ni reiniciamos el dev server.
- **Pagos simulados pero reales en la base:** no hay pasarela conectada, pero el `Pago`
  se **registra** de verdad.
- **Integración real de Mercado Pago:** ver el `TODO` en `checkout.ts`
  (`iniciarPagoMercadoPago()`): ahí se crearía la *preference* / Checkout Pro y se
  esperaría la confirmación por redirect o webhook.

---

## 12. Fotos de productos

- En **Crear/Editar producto** (admin) hay un campo **"Foto del producto"**: selector
  de archivo (solo imágenes), **vista previa**, botón "Quitar foto" y validación de
  que sea imagen y pese **máximo 2 MB**.
- La foto se lee con `FileReader` y se guarda como **base64** en `product.imagen`; viaja
  en el JSON al backend.
- Se muestra en: **catálogo**, **detalle de producto**, **carrito** y **tarjetas del
  admin**. Si un producto no tiene foto, se muestra un degradado como respaldo
  (patrón `@if (imagen) { <img> } @else { <div degradado> }`).

---

## 13. Cómo levantar el frontend

**Requisitos:** Node.js ≥ 22 y el backend corriendo en `localhost:8080`.

```bash
npm install

# Desarrollo con proxy al backend (recomendado)
npm start
# equivale a: ng serve --proxy-config proxy.conf.json
```

Queda en `http://localhost:4200`. El dev server recompila solo al guardar cambios
(watch mode).

> Si lo levantás con `ng serve` sin `--proxy-config`, las llamadas relativas no
> llegarán al backend. Usá `npm start` o agregá `--proxy-config proxy.conf.json`.

Build de producción:
```bash
npm run build   # genera dist/
```

---

## 14. Cómo compartirlo por un túnel

Para que el equipo pruebe la app desde afuera, se expone el `:4200` por un túnel y,
gracias al proxy + rutas relativas, **un solo link** alcanza para que funcione todo
(incluido el backend):

```bash
ng serve --host 0.0.0.0 --port 4200 --proxy-config proxy.conf.json --allowed-hosts
# luego, en otra consola, un túnel al 4200 (ej: cloudflared)
cloudflared tunnel --url http://localhost:4200
```

El backend ya acepta CORS con `*`, así que el dominio del túnel funciona sin configurar nada.
