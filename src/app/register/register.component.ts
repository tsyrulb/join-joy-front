import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../api.service';  // Import your API service

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, NgFor, RouterModule]  // Ensure CommonModule is imported here
})
export class RegisterComponent {
  username = '';
  email = '';  // Add email field
  password = '';
  registrationFailed = false;
  errorMessage: string | null = null;  // To handle error messages

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit() {
    this.apiService.registerUser(this.username, this.email, this.password).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        // After successful registration, redirect to the login page
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.registrationFailed = true;
        this.errorMessage = 'Registration failed. Please try again.';  // Set an error message
      }
    });
  }
}
