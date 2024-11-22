import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token'); // Check for token in local storage

  if (token) {
    // Decode token to check expiration and userId (for debugging)
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

    if (tokenPayload.exp < currentTime) {
      // Token expired
      localStorage.removeItem('token');
      const router = inject(Router);
      router.navigate(['/login']);
      return false;
    }

    return true; // User is authenticated
  } else {
    return false; // User is not authenticated
  }
};

export const guestGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');

  // If a token exists and is valid, redirect to a protected route
  if (token) {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (tokenPayload.exp > currentTime) {
      const router = inject(Router);
      router.navigate(['/profile']);
      return false; // Prevent access to login/signup
    }
  }

  return true; // Allow access if no valid token
};
