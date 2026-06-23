# AGENTS.md — NovaTech ERP (Frontend / G1-ui)

Guía para **agentes de IA y desarrolladores** en el repo **EricWithC04/G1-ui**.

## Antes de cualquier cambio

Leer **[docs/GUARDRAILS.md](./docs/GUARDRAILS.md)** — reglas anti-regresión obligatorias.

## Repositorios

| Componente | GitHub | Rama | Puerto |
|------------|--------|------|--------|
| **Frontend (este repo)** | EricWithC04/G1-ui | `main` | 4200 |
| **Backend** | LeanMongelos/G1-ms | `main` | 8080 |

- Trabajo local git: `D:\notech\_g1-ui-clone` → sincronizar a `D:\notech\frontend`
- **No** mezclar código Java en este repo

## Arranque local

```powershell
# Terminal 1 — Backend (repo G1-ms)
$env:DB_PASSWORD="tu_clave_mysql"
$env:JWT_SECRET="dev-only-cambiar-en-produccion-novatech-2026-secreto-largo"
cd D:\notech\backend
.\mvnw.cmd spring-boot:run -DskipTests

# Terminal 2 — Frontend
cd D:\notech\frontend
npm install
npm start
```

- Tienda: http://localhost:4200
- Admin: http://localhost:4200/admin
- **Siempre** `npm start` (incluye `proxy.conf.json`)

## Credenciales demo

| Email | Rol | Password |
|-------|-----|----------|
| superadmin@novatech.com | SUPERADMIN | admin123 |
| cliente@novatech.com | CLIENTE | cliente123 |

## Arquitectura

- Angular 22 **standalone**, **signals**
- Storefront: `layouts/storefront-layout/`, rutas `/`
- Admin: `layouts/admin-layout/`, rutas `/admin/**`
- API: `services/` + `apiUrl: ''` en `environment.ts`
- Guards: `authGuard`, `adminGuard`, `clienteGuard`, `permisoGuard`
- Interceptors: `credentials.interceptor`, `httpErrorInterceptor`

Documentación monorepo: `D:\notech\docs\` (ARCHITECTURE, ADMIN-ERP, RBAC, …)

## Reglas que NO romper

### Proxy

Nueva ruta backend → clave en `proxy.conf.json`. Sin proxy = HTML en lugar de JSON.

### DI circular

`AuthService` no debe `inject(PermisoService)` en campo. Usar `Injector` lazy (ver `auth.service.ts`).

### Auth

- Sesión: signal + cookie HttpOnly
- App init: `restaurarSesion()` awaited
- Logout: await + navigate + limpiar matriz permisos

### Panel cliente

Resiliente con `catchError`; rutas `/cliente/*` vía proxy.

### RBAC UI

`PermisoService.puede()`; superadmin acceso total vía `config-rbac.ts`.

## Checklist antes de PR

- [ ] Backend smoke verde: `.\mvnw.cmd test -Dtest="com.novatech.store.smoke.*"` (repo G1-ms)
- [ ] Catálogo y login probados con `npm start`
- [ ] Smoke manual: presupuestos, remitos, facturación, envíos, contabilidad, panel-cliente
- [ ] Sin secretos en diff
- [ ] Actualizar GUARDRAILS si descubrís un footgun nuevo

## Commits

- Español, imperativo, una idea por commit
- No: `node_modules/`, `dist/`, `.env`

## Documentación

| Doc | Contenido |
|-----|-----------|
| [docs/GUARDRAILS.md](./docs/GUARDRAILS.md) | Anti-regresiones |
| [README.md](./README.md) | Setup frontend |
| [../backend/SMOKE.md](../backend/SMOKE.md) | Tests API (repo backend) |
| `notech/docs/GUARDRAILS.md` | Copia canónica monorepo |
