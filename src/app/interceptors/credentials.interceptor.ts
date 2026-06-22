import { HttpInterceptorFn } from '@angular/common/http';

/** Envía cookies HttpOnly en cada request al backend (sesión JWT). */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/')) {
    return next(req.clone({ withCredentials: true }));
  }
  return next(req);
};
