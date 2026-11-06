import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Convertimos la promesa del token (Preferences) a un Observable con from()
  return from(authService.getToken()).pipe(
    switchMap((token) => {
      let clonedReq = req;
      
      // Si existe un token, clonamos la petición y le agregamos el header de Authorization
      if (token) {
        clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
      }

      // Continuamos con la petición y atrapamos errores globales como el 401
      return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Token inválido o expirado
            authService.logout();
          }
          return throwError(() => error);
        })
      );
    })
  );
};