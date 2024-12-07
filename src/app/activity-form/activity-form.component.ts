import { Component } from '@angular/core';
import { ActivityService } from '../activity.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivityMapComponent } from '../activity-map/activity-map.component';
import { NotificationService } from '../notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [FormsModule, 
    CommonModule, 
    ActivityMapComponent,
    MatSnackBarModule,
  ],
  templateUrl: './activity-form.component.html',
  styleUrls: ['./activity-form.component.css'],
})
export class ActivityFormComponent {
  activityData = {
    name: '',
    description: '',
    date: '',
    latitude: null as number | null,
    longitude: null as number | null,
    createdById: null as number | null,
  };

  constructor(private activityService: ActivityService, 
    private router: Router, 
    private notificationService: NotificationService) {
    this.setCreatedById();
  }

  private setCreatedById(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.activityData.createdById = tokenPayload?.nameid || null;
        if (!this.activityData.createdById) {
          console.error('No user ID found in token.');
        }
      } catch (error) {
        console.error('Failed to parse token:', error);
      }
    } else {
      console.error('No token found.');
    }
  }
  

  onLocationSelected(location: { latitude: number; longitude: number }): void {
    this.activityData.latitude = location.latitude;
    this.activityData.longitude = location.longitude;
    console.log('Selected location:', location);
  }

  createActivity(): void {
    const { name, date, latitude, longitude, createdById } = this.activityData;

    if (!name || !date || latitude === null || longitude === null || createdById === null) {
      this.notificationService.showMessage('Please fill in all the fields, select a location, and ensure you are logged in.');
      return;
    }

    this.activityService.createActivityWithCoordinates(this.activityData).subscribe({
      next: () => {
        this.notificationService.showMessage('Activity created successfully!');
        this.router.navigate(['/activities']);
      },
      error: (error) => console.error('Error creating activity:', error),
    });
  }
}
