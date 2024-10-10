import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');  // Check for token

  if (token) {
    // Token exists, allow the route activation
    return true;
  } else {
    // No token found, redirect to the login page
    const router = new Router();  // Create a new Router instance
    router.navigate(['/login']);
    return false;
  }
};
