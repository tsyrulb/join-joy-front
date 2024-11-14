import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token'); // Check for token in local storage

  if (token) {
    // Decode token to check expiration and userId (for debugging)
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    console.log('Decoded token payload:', tokenPayload);
    console.log('Token expiration time:', tokenPayload.exp);

    // Check if the token has expired
    if (tokenPayload.exp < currentTime) {
      console.log('Token has expired.');
      localStorage.removeItem('token'); // Remove expired token
      const router = inject(Router);
      router.navigate(['/login']); // Redirect to login if token expired
      return false;
    }

    // If token is valid, allow access
    return true;
  } else {
    const router = inject(Router);
    router.navigate(['/login']); // Redirect to login if token is missing
    return false;
  }
};
