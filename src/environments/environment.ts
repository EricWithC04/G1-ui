// Configuracion para DESARROLLO (cuando trabajamos en nuestra maquina).
// "apiUrl" queda VACIO a proposito: asi todas las llamadas usan rutas
// RELATIVAS (ej: '/productos', '/auth/login') y salen al MISMO origen
// desde el que se sirve la app. El dev server de Angular hace de proxy
// hacia el backend (localhost:8080) segun proxy.conf.json. Gracias a esto
// la app funciona igual aunque se acceda por un tunel publico, sin CORS.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
};