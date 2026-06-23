# NovaTech ERP — Guardrails (frontend)

**Leer antes de tocar auth, proxy, servicios o panel cliente.**

> Copia canónica: `notech/docs/GUARDRAILS.md` (monorepo). Mantener sincronizado.

## Checklist antes de merge

- [ ] `npm start` + catálogo carga (sin pantalla blanca)
- [ ] Login/logout staff y cliente en un clic
- [ ] Nueva ruta API → `proxy.conf.json`
- [ ] Cambios en Auth/Permiso → sin DI circular

## API en desarrollo

```typescript
// environment.ts — apiUrl VACÍO
apiUrl: ''
```

Proxy en `proxy.conf.json` + `angular.json` → `npm start` (no `ng serve` sin proxy).

**Síntoma roto:** `Unexpected token '<', "<!doctype"` = falta proxy o URL incorrecta.

## DI circular (pantalla blanca)

`AuthService` ↔ `PermisoService`: usar `Injector.get(PermisoService)` lazy, no `inject()` mutuo en campos.

## Auth / logout

- `restaurarSesion()` en `app.config.ts` (initializer).
- Logout: `await auth.logout()` antes de navigate; `PermisoService.limpiarMatriz()`.

## Panel cliente

`forkJoin` con `catchError` por endpoint — un API caído no tumba toda la vista.

## Pagos

Aprobadores: filtrar `ADMIN` **y** `SUPERADMIN`.

## UI admin

- Menú POS: **「Punto de venta」** (`/admin/pos`)
- Clases `admin-*`, textos español AR

## Smoke manual (con backend en :8080)

Presupuestos, remitos, facturación, envíos (columnas con datos), contabilidad, panel-cliente.

Credenciales: `superadmin@novatech.com` / `admin123`, `cliente@novatech.com` / `cliente123`.

Ver también [AGENTS.md](./AGENTS.md).
