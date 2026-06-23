# NovaTech ERP — Guardrails (no romper en cada iteración)

**Leer esto antes de tocar backend, frontend o auth.** Documento orientado a humanos y agentes de IA.

## Objetivo

Evitar regresiones que ya ocurrieron: pantalla blanca, JSON inválido, tablas vacías, 500 silenciosos, logout roto, KPIs incoherentes.

## Checklist obligatorio antes de merge

### Backend (G1-ms)

```powershell
cd D:\notech\backend
.\mvnw.cmd test -Dtest="com.novatech.store.smoke.*"
.\mvnw.cmd compile -DskipTests
```

- [ ] **124+ smoke tests** en verde (H2, perfil `test`)
- [ ] Si tocaste entidades JPA → revisar [Serialización JSON](#serialización-json-jackson)
- [ ] Si tocaste un `*Service` → no llamar métodos que se invocan mutuamente sin extraer helper
- [ ] Si agregaste endpoint → registrar en `SmokeEndpointCatalog.java`

### Frontend (G1-ui)

```powershell
cd D:\notech\frontend
npm start   # probar con proxy, NO con apiUrl absoluta en dev
```

- [ ] Catálogo carga en http://localhost:4200 (sin pantalla blanca)
- [ ] Login staff y cliente; logout redirige al login en **un solo clic**
- [ ] Si agregaste ruta API → entrada en `proxy.conf.json`
- [ ] Si tocaste `AuthService` / `PermisoService` → revisar [DI circular](#inyección-circular-angular)

### Smoke manual rápido (5 min)

| Pantalla | URL | Qué debe verse |
|----------|-----|----------------|
| Catálogo | `/` | Productos, sin toast de error |
| Presupuestos | `/admin/presupuestos` | Lista JSON, sin `Unexpected token` |
| Remitos | `/admin/remitos` | Idem |
| Facturación | `/admin/facturacion` | Lista parseable, factura nueva aparece al crear |
| Envíos | `/admin/envios` | Columnas Pedido, Cliente, Total **con datos** |
| Contabilidad | `/admin/configuracion/contabilidad` | Resumen 200, no 500 |
| Panel cliente | `/panel-cliente` | Pedidos listados (rol CLIENTE) |
| Punto de venta | `/admin/pos` | Título "Punto de venta" |

Credenciales demo:

| Rol | Email | Password |
|-----|-------|----------|
| Staff | `superadmin@novatech.com` | `admin123` |
| Cliente | `cliente@novatech.com` | `cliente123` |

---

## Repos y carpetas locales

| Path | GitHub | Notas |
|------|--------|-------|
| `D:\notech\backend` | LeanMongelos/G1-ms | API Spring Boot, puerto **8080** |
| `D:\notech\frontend` | EricWithC04/G1-ui (copia de trabajo) | Angular, puerto **4200** |
| `D:\notech\_g1-ui-clone` | EricWithC04/G1-ui (remote git) | Commits y PRs desde acá |
| `D:\notech\docs` | Solo monorepo local | Índice en `docs/README.md` |

**Regla:** cambios de frontend → commitear en `_g1-ui-clone` y sincronizar a `frontend/`.

---

## Serialización JSON (Jackson)

### Problema

Devolver entidades JPA completas en controllers provoca:

- Referencias circulares → `Unexpected token '}'`, `}}}}`, respuestas truncadas
- Grafos enormes (`producto.imagen` base64 en listas) → parse errors, timeouts
- `@JsonIgnore` mal puesto → **campos que la UI necesita desaparecen** (ej. envíos sin pedido)

### Reglas

1. **Back-references en líneas de detalle:** `@JsonIgnore` en el padre (`DetallePresupuesto.presupuesto`, `DetalleRemito.remito`, `DetallePedido.pedido`, etc.).
2. **Relaciones ManyToOne hacia arriba (lo que la UI lista):** **NO** usar `@JsonIgnore` a ciegas. Preferir `@JsonIgnoreProperties({"notas", "lineas", ...})` como en `Remito`, `Factura`, `Envio`.
3. **Producto anidado:** `@JsonIgnoreProperties({"imagen", "descripcion"})` en todos los `Detalle*`.
4. **Billing entities:** `Presupuesto`, `Remito`, `Factura` ya tienen recorte de grafos — no quitar sin probar smoke + UI.
5. **Preferencia a largo plazo:** DTOs de respuesta en lugar de entidades para listados.

### Regresiones cubiertas por tests

| Test | Bug histórico |
|------|----------------|
| `presupuestosListReturnsJsonArrayWithoutServerError` | JSON circular en presupuestos |
| `remitosListReturnsJsonArrayWithoutServerError` | JSON circular en remitos |
| `facturasListReturnsParseableJsonWithoutHugePayload` | Payload gigante / JSON inválido |
| `contabilidadResumenReturnsJsonObjectWithoutRecursion` | StackOverflow en servicio |
| `enviosListIncludesPedidoForTableDisplay` | Tabla envíos vacía (pedido ignorado) |
| `clientePedidosAndPerfilReturnJsonForCliente` | Portal cliente HTML/JSON |
| `deleteProductoReferenciadoReturns400Not500` | DELETE producto demo → 500 |

Archivo: `backend/src/test/java/com/novatech/store/smoke/RegressionSmokeTest.java`

---

## Servicios backend — recursión

### Bug histórico: ContabilidadConfigService

`resumen()` llamaba `ensureContabilidadArgentina()` que volvía a llamar `resumen()` → **StackOverflow → 500**.

### Regla

- Métodos `ensure*` / seed: solo escriben datos; no re-entran al método público que los invoca.
- Extraer `buildResumen()` privado; un solo nivel de orquestación.

---

## Inyección circular (Angular)

### Bug histórico: pantalla blanca

`AuthService` inyectaba `PermisoService` y viceversa → Angular no bootstrapea (`app-root` vacío).

### Regla

- **Nunca** `inject(PermisoService)` como campo en `AuthService`.
- Usar `Injector` y resolver lazy: `this.injector.get(PermisoService)` dentro de métodos.
- `provideAppInitializer(() => inject(AuthService).restaurarSesion())` depende de que AuthService instancie.

Archivos: `auth.service.ts`, `permiso.service.ts`, `app.config.ts`

---

## Proxy y API URL (frontend)

### Desarrollo

```typescript
// environment.ts — apiUrl VACÍO a propósito
export const environment = { production: false, apiUrl: '' };
```

Todas las llamadas son rutas relativas (`/productos`, `/auth/me`). El dev server proxy (`proxy.conf.json`) las envía a `:8080`.

### Síntoma si está mal

`Unexpected token '<', "<!doctype "...` → el frontend pidió JSON pero recibió **index.html** (ruta no proxied o URL mal formada).

### Regla

- Nueva ruta backend `@RequestMapping("/foo")` → agregar `"/foo"` en `proxy.conf.json`.
- `credentials.interceptor.ts` debe enviar cookies también cuando `apiUrl` es absoluta (producción).

---

## Auth y sesión

- JWT en **cookie HttpOnly**; sesión en memoria (`AuthService.usuarioActual` signal).
- `restaurarSesion()` en app initializer: await antes de renderizar rutas protegidas.
- Logout: `await auth.logout()` **antes** de `router.navigate(['/login'])`; limpiar `PermisoService.limpiarMatriz()`.
- Staff vs CLIENTE: `clienteGuard` en `/panel-cliente`, `adminGuard` en `/admin/**`.

---

## Borrado de productos demo

Los productos 1–4 están referenciados en pedidos/presupuestos/listas. DELETE debe devolver **400/409** con mensaje claro, no 500 por FK.

Implementación: `ProductoService.eliminar()` + `GlobalExceptionHandler`.

---

## KPIs y métricas

- **Una sola fuente** backend: `CrmMetricsService`, `StockInventarioUtil`, `PagoUtil`.
- Frontend: no recalcular KPIs locales; consumir endpoints de dashboard/CRM.
- Stock bajo: misma fórmula en dashboard e inventario.

---

## RBAC y pagos

- Filtro aprobadores en pagos: incluir `SUPERADMIN` **y** `ADMIN` (`pagos.ts`).
- Rutas `/config/**` staff-only en backend.

---

## Panel cliente — resiliencia

- `panel-cliente.ts`: `forkJoin` con `catchError` por endpoint; un fallo no debe tumbar toda la pantalla.
- Endpoints: `/cliente/pedidos`, `/cliente/perfil`, `/cliente/facturas`.

---

## Arranque local (Windows)

```powershell
# Terminal 1 — Backend
$env:DB_PASSWORD="tu_clave_mysql"
$env:JWT_SECRET="dev-only-cambiar-en-produccion-novatech-2026-secreto-largo"
cd D:\notech\backend
.\mvnw.cmd spring-boot:run -DskipTests

# Terminal 2 — Frontend
cd D:\notech\frontend
npm start
```

Si un puerto está ocupado, **no** levantar otra instancia encima: matar el PID o reutilizar la existente.

---

## Documentación relacionada

| Doc | Contenido |
|-----|-----------|
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Setup, estructura, comandos |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Capas y topología |
| [ADMIN-ERP.md](./ADMIN-ERP.md) | Rutas admin y módulos |
| [API.md](./API.md) | Endpoints por dominio |
| [RBAC.md](./RBAC.md) | Roles y permisos |
| [../backend/SMOKE.md](../backend/SMOKE.md) | Suite smoke detallada |
| [../backend/AGENTS.md](../backend/AGENTS.md) | Guía agentes backend |
| [../frontend/AGENTS.md](../frontend/AGENTS.md) | Guía agentes frontend |

---

## Cuando agregues una regla nueva

1. Arreglar el bug.
2. Agregar test en `RegressionSmokeTest` o `ApiSmokeTest`.
3. Documentar la regla en **esta sección** con síntoma + causa + archivos.
4. Actualizar checklist manual si aplica.

*Última revisión: junio 2026 — post PRs #24–#27 (backend), #36–#38 (frontend).*
