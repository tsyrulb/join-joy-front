import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { User, Location, UpdateUserRequest } from '../user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
})
export class ProfileComponent implements OnInit {
  user: User = {
    id: 0,
    name: '',
    email: '',
    password: '',
    profilePhoto: '',
    gender: '',
    dateOfBirth: '',
    location: { id: 0, latitude: 0, longitude: 0, address: '' },
  };
  selectedSection: string = 'details'; // Default section
  addressInput: string = '';  // Temporary variable for address
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.id;

      this.apiService.getUser(userId).subscribe({
        next: (data) => {
          this.user = data;
          if (this.user.locationId) {
            this.loadLocation(this.user.id);
          }
          if (this.user.dateOfBirth) {
            this.user.dateOfBirth = this.formatDateForInput(this.user.dateOfBirth);
          }
        },
        error: (error) => {
          console.error('Error fetching user:', error);
          this.errorMessage = 'Error fetching user data';
        },
      });
    }
  }

  loadLocation(userId: number): void {
    this.apiService.getLocation(userId).subscribe({
      next: (locationData) => {
        this.user!.location = locationData as unknown as Location;
        this.addressInput = this.user!.location.address; // Update address input
              },
      error: (error) => {
        console.error('Error fetching location:', error);
        this.errorMessage = 'Could not fetch location details';
      },
    });
  }

  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.user) {
          this.user.profilePhoto = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    if (this.user) {
      const updatedUser: UpdateUserRequest = {
        name: this.user.name || '',
        email: this.user.email || '',
        password: this.user.password || '',
        gender: this.user.gender || '',
        profilePhoto: this.user.profilePhoto || '',
        dateOfBirth: this.user.dateOfBirth ? new Date(this.user.dateOfBirth) : null,
        location: this.user.location || { id: 0, latitude: 0, longitude: 0, address: '' },
      };
      
      this.apiService.updateUser(this.user.id, updatedUser).subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          this.successMessage = 'Profile updated successfully';
          this.loadUserData(); // Refresh data after update
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.errorMessage = 'Error updating profile';
        },
      });
    }
  }

  selectSection(section: string): void {
    this.selectedSection = section;
  }
}
