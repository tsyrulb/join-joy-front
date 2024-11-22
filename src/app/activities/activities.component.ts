import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../activity.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
})
export class ActivitiesComponent  implements OnInit {
  activities: any[] = [];
  currentUserId: number = 0;

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.setUserId();
    this.loadUserActivities();
  }

  loadUserActivities(): void {
    this.activityService.getUserActivitiesWithParticipants().subscribe({
      next: (data) => {
        this.activities = data;
      },
      error: (error) => {
        console.error('Error fetching user activities:', error);
        alert('Failed to load activities. Please try again.');
      },
    });
  }

  removeParticipant(activityId: number, userId: number): void {
    if (confirm('Are you sure you want to remove this participant?')) {
      this.activityService.removeUser(activityId, userId).subscribe({
        next: (response) => {
          console.log('Remove response:', response);
          alert(response.message || 'Participant removed successfully!');
          this.loadUserActivities(); // Refresh activities
        },
        error: (error) => {
          console.error('Error removing participant:', error);
          alert(
            error.error?.message || 'Failed to remove participant. Please try again.'
          );
        },
      });
    }
  }
  
  
  canRemoveParticipant(activity: any): boolean {
    // Add logic to check if the current user can remove participants (e.g., is the creator of the activity)
    const currentUserId = this.currentUserId; // Fetch user ID from token or service
    return activity.createdById == currentUserId; // Replace `creatorId` with the actual field name
  }
  

  addParticipant(activityId: number): void {
    const userId = prompt('Enter the user ID to add:');
    if (userId) {
      this.activityService.addUser(activityId, parseInt(userId, 10)).subscribe({
        next: () => {
          alert('Participant added successfully.');
          this.loadUserActivities(); // Refresh the list
        },
        error: (error) => {
          console.error('Error adding participant:', error);
          alert('Failed to add participant.');
        },
      });
    }
  }

  private setUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = tokenPayload.nameid;
        console.log('Extracted userId from token:', this.currentUserId);
      } catch (e) {
        console.error('Failed to decode token', e);
      }
    } else {
      console.error('Token not found');
    }
  }
}
