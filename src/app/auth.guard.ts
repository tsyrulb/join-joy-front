import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token'); // Check for token in local storage

  if (token) {
    return true; // Allow access if token exists
  } else {
    const router = inject(Router);
    router.navigate(['/login']); // Redirect to login if not authenticated
    return false;
  }
};
