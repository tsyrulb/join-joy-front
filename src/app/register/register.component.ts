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
  imports: [FormsModule, CommonModule, NgFor, RouterModule] 
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  city = ''; // City as a simple string

  errorMessage: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit() {
    this.apiService.registerUser(this.username, this.email, this.password, this.city).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.errorMessage = 'Registration failed. Please try again.';
      }
    });
  }
}
