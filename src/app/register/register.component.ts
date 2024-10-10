import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, NgFor, RouterModule]  // Ensure CommonModule is imported here
})
export class RegisterComponent {
  username = '';
  password = '';
  registrationFailed = false;

  constructor(private router: Router) {}

  onSubmit() {
    console.log('Username:', this.username);
    console.log('Password:', this.password);
    // Add your registration logic here

    // After successful registration, redirect to login page
    this.router.navigate(['/login']);
  }
}
