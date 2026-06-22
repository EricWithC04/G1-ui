# AGENTS.md — NovaTech Store (Frontend)

Guía para **agentes de IA y desarrolladores** que trabajan en este repositorio.
Todo el trabajo de frontend se documenta y commitea **en español** (mensajes, ramas descriptivas, PRs).

---

## Repositorios

| Componente | GitHub | Rama de referencia | Descripción |
|------------|--------|--------------------|-------------|
| **Frontend** | [EricWithC04/G1-ui](https://github.com/EricWithC04/G1-ui) | `banners` | Angular 22 — tienda + panel admin |
| **Backend** | [LeanMongelos/G1-ms](https://github.com/LeanMongelos/G1-ms) | `main` | Spring Boot — API REST + MySQL |

- URL exacta del backend: **https://github.com/LeanMongelos/G1-ms**
- URL exacta del frontend: **https://github.com/EricWithC04/G1-ui**

No mezclar código de backend en este repo. La integración es solo vía HTTP (rutas relativas + proxy en desarrollo).

---

## Cómo levantar el entorno

1. **Backend** (repo `LeanMongelos/G1-ms`): Java + MySQL, puerto **8080**.
2. **Frontend** (este repo):
   ```bash
   npm install
   npm start   # ng serve con proxy.conf.json → localhost:8080
   ```
3. App en **http://localhost:4200**.

Credenciales demo (datos del backend): `admin@novatech.com` / `admin123`, `cliente@novatech.com` / `cliente123`.

---

## Arquitectura rápida

- **Angular standalone** (sin NgModules), **signals** para estado reactivo.
- **Storefront:** layouts en `src/app/layouts/storefront-layout/`, páginas en `src/app/pages/`.
- **Admin:** `src/app/layouts/admin-layout/`, rutas bajo `/admin`.
- **API:** `src/app/services/` — `apiUrl` vacío en `environment.ts`; el proxy reenvía al backend.
- **Modelos:** `src/app/models/`.
- **Guards:** `auth.guard.ts`, `admin.guard.ts`.

Documentación detallada del frontend: [`README.md`](./README.md).

---

## Rama `banners` — qué incluye

Funcionalidad principal de esta rama:

### Landings y banners
- Config central: `src/app/data/landing-pages.ts`.
- Páginas:
  - `src/app/pages/categoria-landing/` — rutas `/categoria/:slug` y aliases (`/notebooks`, `/monitores`, etc.).
  - `src/app/pages/promo-landing/` — `/hot-sale`, `/cyber-week`.
- En el catálogo (`catalogo.html`), los banners usan `routerLink` hacia esas rutas (ya no solo anclas al listado).

### UI / tienda
- Separación body/footer: clases `.store-body-footer-divider`, `.store-footer` en `styles.css`.
- Logo agrandado: `public/logo.png` (backup en `public/logo-original.png`), estilos `.store-logo-link`.

### Admin — validación de categorías
- Utilidad: `src/app/utils/categoria-nombre.ts`.
- Reglas: nombre empieza con letra, sin `.`, sin `--`, mínimo 2 letras, no más dígitos que letras.
- Usado en `src/app/pages/categorias/`.

### Proxy de desarrollo
- `proxy.conf.json` + `"proxyConfig"` en `angular.json` — obligatorio usar `npm start`.

---

## Convenciones para commits y ramas

- **Ramas:** nombres cortos en minúsculas, en español o inglés técnico (`banners`, `fix-checkout`, `validacion-categorias`).
- **Commits:** mensajes en **español**, imperativo, una idea por commit.
  - Ejemplo: `Agrega landings de categoría y promos con banners en catálogo`
- **No commitear:** `node_modules/`, `dist/`, `.env`, credenciales, archivos `*.zip`.
- **No pushear** al backend salvo que el usuario lo pida explícitamente.

---

## Checklist antes de push

- [ ] Backend local responde en `:8080` y el flujo probado con `npm start`.
- [ ] Sin secretos en el diff.
- [ ] `npm run build` sin errores (si hubo cambios grandes).
- [ ] README/AGENTS actualizados si cambian repos, rutas o convenciones.

---

## Orden de subida incremental

En el monorepo local (`notech/`) existe `orden-subida-frontend.md` con el checklist por etapas (scaffold → modelos → servicios → páginas). Útil para PRs pequeños; la rama `banners` puede agrupar varias etapas ya integradas.

---

## Contacto / ownership

- Frontend: repo **EricWithC04/G1-ui** (colaboradores del equipo UI).
- Backend: repo **LeanMongelos/G1-ms** (API compartida del grupo).
