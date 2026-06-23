import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** Envía cookies HttpOnly en cada request al backend (sesión JWT). */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl ?? '';
  const esApiBackend =
    req.url.startsWith('/') ||
    (apiUrl.length > 0 && req.url.startsWith(apiUrl));
  if (esApiBackend) {
    return next(req.clone({ withCredentials: true }));
  }
  return next(req);
};
