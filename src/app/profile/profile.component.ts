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
  selectedFile: File | null = null; // For profile photo selection
  selectedSection: string = 'details'; // Default section
  addressInput: string = ''; // Temporary variable for address
  errorMessage: string | null = null;
  successMessage: string | null = null;
  photoPreview: string | ArrayBuffer | null = null; // Preview of the selected photo

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadUserData();
    if (!this.user?.location) {
      this.user.location = { id: 0, latitude: 0, longitude: 0, address: '' };
    }
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
          } else {
            this.user.location = { id: 0, latitude: 0, longitude: 0, address: '' };
          }
          this.addressInput = this.user?.location?.address || '';
          if (this.user.dateOfBirth) {
            this.user.dateOfBirth = this.formatDateForInput(
              this.user.dateOfBirth
            );
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
    this.selectedFile = file;

    // Create a preview of the selected photo
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result; // Set the preview image data
    };
    reader.readAsDataURL(file);
  }

  uploadPhoto(): void {
    if (this.selectedFile && this.user) {
      this.apiService.uploadUserProfilePhoto(this.user.id, this.selectedFile).subscribe({
        next: (response) => {
          this.user.profilePhoto = response.photoUrl;
          this.photoPreview = null; // Clear the preview
          this.successMessage = 'Profile photo updated successfully';
        },
        error: (error) => {
          console.error('Error uploading profile photo:', error);
          this.errorMessage = 'Error uploading profile photo';
        },
      });
    }
  }

  deleteProfilePhoto(): void {
    if (this.user) {
      this.apiService.deleteUserProfilePhoto(this.user.id).subscribe({
        next: () => {
          this.user.profilePhoto = ''; // Clear the photo URL
          this.successMessage = 'Profile photo deleted successfully';
        },
        error: (error) => {
          console.error('Error deleting profile photo:', error);
          this.errorMessage = 'Error deleting profile photo';
        },
      });
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
        dateOfBirth: this.user.dateOfBirth
          ? new Date(this.user.dateOfBirth)
          : null,
        address: this.user.location?.address || ''
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
