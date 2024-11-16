import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../activity.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
})
export class ActivitiesComponent implements OnInit {
  activities = [];

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.activityService.getAllActivities().subscribe({
      next: (data) => (this.activities = data),
      error: (error) => console.error('Error fetching activities:', error),
    });
  }

  deleteActivity(activityId: number): void {
    if (confirm('Are you sure you want to delete this activity?')) {
      this.activityService.deleteActivity(activityId).subscribe({
        next: () => {
          alert('Activity deleted successfully!');
          this.loadActivities();
        },
        error: (error) => console.error('Error deleting activity:', error),
      });
    }
  }
}
