import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';

import { inject } from '@angular/core';

import { catchError, throwError } from 'rxjs';

import { ToastService } from '../services/toast.service';

import { primerErrorCampos } from '../utils/validadores-form';



const SILENCIAR = ['/ping', '/actuator/health', '/admin/notificaciones'];



function mensajeAmigable(err: HttpErrorResponse): string {

  if (err.status === 400) {

    const fieldMsg = primerErrorCampos(err.error?.fields);

    if (fieldMsg) return fieldMsg;

  }

  if (err.status === 0) {

    return 'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.';

  }

  if (err.status === 401 || err.status === 403) {

    return 'No tenés permisos para realizar esta acción.';

  }

  if (err.status === 404) {

    return err.error?.message ?? 'Recurso no encontrado.';

  }

  if (err.status >= 500) {

    return err.error?.message ?? 'Error interno del servidor. Intentá de nuevo más tarde.';

  }

  return err.error?.message ?? err.message ?? 'Ocurrió un error inesperado.';

}



/**
 * Interceptor HTTP `http-error.interceptor`: modifica requests/responses globales (cookies, errores).
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {

  const toast = inject(ToastService);

  const silenciar = SILENCIAR.some(p => req.url.includes(p));



  return next(req).pipe(

    catchError((err: HttpErrorResponse) => {

      if (!silenciar && err.status !== 401) {

        toast.error(mensajeAmigable(err));

      }

      return throwError(() => err);

    }),

  );

};

