import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel two-way binding
import { ApiService } from '../api.service';  // Ensure this service exists

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,  // Make it a standalone component
  imports: [FormsModule, CommonModule, RouterModule]  // Import FormsModule and CommonModule directly
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  onLogin(): void {
    this.apiService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        if (response.token) {
          // Store the token in localStorage for future authenticated requests
          localStorage.setItem('token', response.token);

          // Redirect the user to the profile or another secure page
          this.router.navigate(['/profile']);
        } else {
          // Handle the case where there is no token
          this.errorMessage = 'Login failed: no token received.';
        }
      },
      error: (error: any) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Invalid username or password. Please try again.';
      }
    });
  }
    
}
