import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard para verificar que el usuario ha iniciado sesión
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, lo mandamos al login
  router.navigate(['/login']);
  return false;
};

// Guard para verificar el rol del usuario (cliente, conductor, admin)
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.currentUser();

    if (user && allowedRoles.includes(user.role)) {
      return true;
    }

    // Si no tiene el rol adecuado, lo redirigimos según su rol o al home
    router.navigate(['/']);
    return false;
  };
};