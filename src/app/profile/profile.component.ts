import { Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../api.service';
import { User, UpdateUserRequest, Location } from '../user.model';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog-component/confirm-dialog-component.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatSidenavModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
})
export class ProfileComponent implements OnInit {
  nameid: number | null = null;
  user: User = {
    id: 0,
    name: '',
    email: '',
    password: '',
    profilePhoto: '',
    gender: '',
    dateOfBirth: '',
    location: { id: 0, latitude: 0, longitude: 0, address: '' },
    distanceWillingToTravel: 0,
  };
  selectedFile: File | null = null;
  selectedSection: string = 'details';
  addressInput: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  photoPreview: string | ArrayBuffer | null = null;
  unavailabilities: any[] = []; // List of unavailability periods
  newUnavailability = {
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
  }; // Model for adding new unavailability

  daysOfWeek = [
    { value: 0, viewValue: 'Sunday' },
    { value: 1, viewValue: 'Monday' },
    { value: 2, viewValue: 'Tuesday' },
    { value: 3, viewValue: 'Wednesday' },
    { value: 4, viewValue: 'Thursday' },
    { value: 5, viewValue: 'Friday' },
    { value: 6, viewValue: 'Saturday' },
  ];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.setUserId();
    if (this.nameid) {
      console.log('User ID found:', this.nameid);
      this.loadUserData();
      this.loadUnavailabilities();
    } else {
      console.error('User ID not found in token');
      this.errorMessage = 'User ID not found';
    }
  }

  private setUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.nameid = tokenPayload.nameid;
        console.log('Extracted userId from token:', this.nameid);
      } catch (e) {
        console.error('Failed to decode token', e);
        this.errorMessage = 'Failed to decode token';
      }
    } else {
      console.error('Token not found');
    }
  }
  // Fetch all unavailabilities
  loadUnavailabilities(): void {
    this.apiService.getUnavailabilities().subscribe({
      next: (data) => {
        this.unavailabilities = data;
      },
      error: (error) => {
        console.error('Error fetching unavailabilities:', error);
      },
    });
  }

  // Add a new unavailability period
  addUnavailability(): void {
    if (
      this.newUnavailability.dayOfWeek !== null &&
      this.newUnavailability.startTime &&
      this.newUnavailability.endTime
    ) {
      const payload = {
        dayOfWeek: Number(this.newUnavailability.dayOfWeek),
        startTime: this.newUnavailability.startTime,
        endTime: this.newUnavailability.endTime,
      };

      this.apiService.addUnavailability(payload).subscribe({
        next: () => {
          this.snackBar.open('Unavailability added successfully.', 'OK', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
          this.loadUnavailabilities();
          this.newUnavailability = { dayOfWeek: 0, startTime: '', endTime: '' };
          // Update Flask as well
          this.apiService
            .updateUserUnavailabilityInFlask(this.nameid)
            .subscribe({
              next: () => {},
              error: (error) => {
                console.error('Error updating unavailability in Flask:', error);
              },
            });
        },
        error: (error) => {
          console.error('Error adding unavailability:', error);
          this.snackBar.open('Failed to add unavailability.', 'OK', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'center',
          });
        },
      });
    } else {
      this.snackBar.open('Please fill out all fields.', 'OK', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
      });
    }
  }

  // Remove an unavailability period
  removeUnavailability(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {}, // No extra data needed
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.apiService.removeUnavailability(id).subscribe({
          next: () => {
            this.snackBar.open('Unavailability removed successfully.', 'OK', {
              duration: 3000,
            });
            this.loadUnavailabilities();
          },
          error: (error) => {
            console.error('Error removing unavailability:', error);
            this.snackBar.open('Failed to remove unavailability.', 'OK', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  loadUserData(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.nameid; // Correctly access nameid as userId

      if (userId) {
        console.log('Extracted userId from token:', userId);
        this.apiService.getUser(userId).subscribe({
          next: (data) => {
            this.user = data;
            if (this.user.locationId) {
              this.loadLocation(this.user.id);
            } else {
              this.user.location = {
                id: 0,
                latitude: 0,
                longitude: 0,
                address: '',
              };
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
      } else {
        console.error('User ID not found in token');
      }
    }
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
      this.apiService
        .uploadUserProfilePhoto(this.nameid, this.selectedFile)
        .subscribe({
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
        address: this.user.location?.address || '',
        distanceWillingToTravel: this.user.distanceWillingToTravel,
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

  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  selectSection(section: string): void {
    console.log(`Switching to section: ${section}`);
    this.selectedSection = section;
  }
}
