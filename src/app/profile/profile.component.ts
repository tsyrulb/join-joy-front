import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { User, UpdateUserRequest } from '../user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';  // Import CommonModule for NgIf

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,  // Standalone component
  imports: [FormsModule, CommonModule]  // Add CommonModule for *ngIf
})
export class ProfileComponent implements OnInit {
  user: User | null = null;  // Initialize user to null
  errorMessage: string | null = null;  // Declare and initialize errorMessage
  successMessage: string | null = null;  // Message for successful update

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the JWT to extract the user ID
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));  // Decode JWT payload
      const userId = tokenPayload.id;  // Assuming 'id' is the key for the user ID in the payload

      // Fetch the user profile using the decoded user ID
      this.apiService.getUser(userId).subscribe({
        next: (data) => {
          this.user = data;  // Assuming 'data' contains the user profile
        },
        error: (error) => {
          console.error('Error fetching user:', error);
          this.errorMessage = 'Error fetching user data';
        }
      });
    }
  }

  updateProfile(): void {
    if (this.user) {
      // Construct the UpdateUserRequest object
      const updatedUser: UpdateUserRequest = {
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,  // Include password only if you want to allow updates to it
        profilePhoto: this.user.profilePhoto,
        dateOfBirth: this.user.dateOfBirth ? this.user.dateOfBirth.toISOString().split('T')[0] : undefined,
        address: this.user.location?.address  // Include the address from the location
      };
  
      // Call the API to update the user details
      this.apiService.updateUser(this.user.id, updatedUser).subscribe({
        next: (data) => {
          console.log('Profile updated successfully:', data);
          this.errorMessage = null;  // Clear error message
          this.successMessage = 'Profile updated successfully';  // Set success message
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.errorMessage = 'Error updating profile';  // Set error message
          this.successMessage = null;  // Clear success message
        }
      });
    }
  }
  
}
