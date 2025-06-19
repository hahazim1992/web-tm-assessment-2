import { AuthService } from './../services/auth.service';
import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.hasValidToken()) {
    return true;
  } else {
    auth.logout();
    return router.createUrlTree(['/login']);
  }
};