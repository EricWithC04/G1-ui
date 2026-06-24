/**
 * Punto de entrada Angular: arranca la SPA con `App` y la config (router, HTTP, sesión).
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
