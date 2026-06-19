// Este archivo se mantiene por compatibilidad: antes los modelos vivian aca.
// Ahora todos los modelos de la tienda estan juntos en "models.ts".
// Volvemos a exportar Product y Categoria desde alli para que el codigo viejo
// que importa desde "product.model" siga funcionando sin cambios.
export type { Product, Categoria } from './models';
