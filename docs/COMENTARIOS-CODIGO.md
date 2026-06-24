# Comentarios en el código — NovaTech ERP

## Qué se hizo

Se documentó **todo el código de aplicación** con comentarios de cabecera en español:

| Ámbito | Archivos | Tipo de comentario |
|--------|----------|-------------------|
| Backend Java | ~187 clases + 10 `package-info.java` | JavaDoc `/** ... */` antes de cada clase |
| Frontend TypeScript | ~100 módulos | JSDoc antes de `@Component` / `export` |
| Plantillas HTML | 46 páginas | `<!-- Pantalla: ... -->` al inicio |
| Índice | [CODEMAP.md](./CODEMAP.md) | Tabla archivo → qué hace |

Entidades JPA que ya tenían comentarios línea a línea (Producto, Pedido, etc.) se mantuvieron.

## Cómo leer el código

1. **Vista rápida:** abrí [CODEMAP.md](./CODEMAP.md) y buscá el archivo.
2. **En el IDE:** abrí el archivo; la primera docblock explica el rol del módulo.
3. **Por capa (backend):** leé `package-info.java` en `controller/`, `service/`, `entity/`, etc.
4. **Reglas de negocio:** [GUARDRAILS.md](./GUARDRAILS.md) (qué no romper).

## Scripts de mantenimiento

En `backend/scripts/` (ejecutar desde repo backend):

```powershell
python scripts/add-file-comments.py    # nuevos .java/.ts sin cabecera
python scripts/add-html-comments.py    # nuevos .html en pages/
python scripts/fix-ts-comment-order.py # JSDoc antes de decoradores
python scripts/generate-codemap.py     # regenerar CODEMAP.md
```

Tras crear archivos nuevos, correr los scripts y commitear.

## Estilo acordado

- Idioma: **español**
- Una frase clara: **qué es** + **para qué sirve** + **capa** (REST / servicio / UI)
- No comentar lo obvio en cada línea; la cabecera + nombres descriptivos alcanzan
