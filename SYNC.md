# Sincronización de equipo — NovaTech ERP (Frontend)

Estado validado en local (Jun 2026). Tras merge, el equipo debe hacer `git pull origin main`.

## Alinear tu PC

```powershell
cd D:\notech\_g1-ui-clone
git checkout main
git pull origin main
npm install
npm start
```

Backend en paralelo (repo G1-ms): `.\mvnw.cmd spring-boot:run -DskipTests` en `:8080`.

## Carpeta `frontend/` sin git

Si trabajás en `D:\notech\frontend` (copia):

```powershell
robocopy D:\notech\_g1-ui-clone\src D:\notech\frontend\src /MIR /XD node_modules .angular
copy D:\notech\_g1-ui-clone\README.md D:\notech\frontend\
copy D:\notech\_g1-ui-clone\docs\GUARDRAILS.md D:\notech\frontend\docs\
```

## Verificación

- http://localhost:4200 — catálogo carga (Ctrl+Shift+R)
- Login staff / cliente
- Smoke backend: `.\mvnw.cmd test -Dtest="*Smoke*"` en repo G1-ms

## Documentación

- [docs/GUARDRAILS.md](./docs/GUARDRAILS.md)
- [AGENTS.md](./AGENTS.md)
