import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';  
import { NotificationService } from '../notification.service'; 
import { SignalRNotificationService } from '../signalr-notification.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService,
    private signalRNotificationService: SignalRNotificationService 
  ) {}

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter your username and password.';
      return;
    }

    this.apiService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        if (response.token) {
          // Store the token in localStorage
          localStorage.setItem('token', response.token);

          this.signalRNotificationService.startConnection(response.token)
            .then(() => {
              console.log('SignalR connection established after login.');
            })
            .catch(err => console.error('Error starting SignalR connection:', err));

          // Show a success message
          this.notificationService.showMessage('Login successful!');

          // Redirect the user to the profile page
          this.router.navigate(['/profile']);
        } else {
          this.errorMessage = 'Login failed: no token received.';
          this.notificationService.showMessage('Login failed: no token received.', 4000);
        }
      },
      error: (error: any) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Invalid username or password. Please try again.';
        this.notificationService.showMessage('Invalid username or password.', 4000);
      }
    });
  }
}
