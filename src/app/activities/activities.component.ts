import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../activity.service';
import { CommonModule } from '@angular/common';
import { GoogleSearchService } from '../google-search.service';
import { FeedbackService } from '../feedback.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
})
export class ActivitiesComponent implements OnInit {
  activities: any[] = [];
  currentUserId: number = 0;
  defaultImageUrl = './assets/images/image.png';
  activityImages: { [key: string]: string } = {};
  visibleActionsIndex: number | null = null; // Index of the participant whose actions are visible

  // Feedback Modal State
  isFeedbackModalVisible = false;
  feedbackType: 'user' | 'activity' | null = null;
  feedbackData = {
    rating: 1,
    activityId: null,
    targetUserId: null,
  };
  constructor(
    private activityService: ActivityService,
    private googleSearchService: GoogleSearchService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.setUserId();
    this.loadUserActivities();
  }
  // Toggle visibility for specific activity and participant
  toggleActionsVisibility(
    activityIndex: number,
    participantIndex: number
  ): void {
    const activity = this.activities[activityIndex];
    if (activity) {
      activity.visibleActionsIndex =
        activity.visibleActionsIndex === participantIndex
          ? null
          : participantIndex;
    }
  }
  loadUserActivities(): void {
    this.activityService.getUserActivitiesWithParticipants().subscribe({
      next: (data) => {
        this.activities = data.map((activity) => ({
          ...activity,
          visibleActionsIndex: null, // Initialize a visibility index for each activity
        }));
        this.activities.forEach((activity) =>
          this.fetchActivityImage(activity.name)
        );
      },
      error: (error) => {
        console.error('Error fetching user activities:', error);
        alert('Failed to load activities. Please try again.');
      },
    });
  }
  openFeedbackModal(activityId: number, targetUserId: number | null, type: 'user' | 'activity'): void {
    console.log('Opening feedback modal:', { activityId, targetUserId, type }); // Debug log
    this.isFeedbackModalVisible = true;
    this.feedbackType = type;
    this.feedbackData = {
      rating: 1,
      activityId,
      targetUserId,
    };
  }
  
  submitFeedbackAutomatically(activityId: number, userId: number): void {
    const feedbackRequest = {
      userId: this.currentUserId,
      activityId,
      targetUserId: userId,
      rating: 1, // Automatically send feedback with a rating of 1
    };
  
    this.feedbackService.submitFeedback(feedbackRequest).subscribe({
      next: () => {
      },
      error: (error) => {
        console.error('Error sending feedback:', error);
        alert('Failed to send feedback. Please try again.');
      },
    });
  }
  
  closeFeedbackModal(): void {
    this.isFeedbackModalVisible = false;
    this.feedbackType = null;
  }

  submitFeedback(): void {
    if (
      !this.feedbackData.rating ||
      this.feedbackData.rating < 1 ||
      this.feedbackData.rating > 5
    ) {
      alert('Please select a valid rating between 1 and 5.');
      return;
    }

    const feedbackRequest = {
      userId: this.currentUserId,
      activityId: this.feedbackData.activityId,
      targetUserId:
        this.feedbackType === 'user' ? this.feedbackData.targetUserId : null,
      rating: this.feedbackData.rating,
    };

    this.feedbackService.submitFeedback(feedbackRequest).subscribe({
      next: () => {
        alert('Feedback submitted successfully.');
        this.closeFeedbackModal();
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback.');
      },
    });
  }

  fetchActivityImage(activityName: string): void {
    this.googleSearchService.searchImages(activityName).subscribe({
      next: (response) => {
        if (response.items && response.items.length > 0) {
          this.activityImages[activityName] = response.items[0].link;
        } else {
          console.warn(`No images found for activity: ${activityName}`);
        }
      },
      error: (error) => {
        console.error(`Error fetching image for ${activityName}:`, error);
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
            error.error?.message ||
              'Failed to remove participant. Please try again.'
          );
        },
      });
    }
  }

  canRemoveParticipant(activity: any): boolean {
    // Ensure activity and participants exist
    if (
      !activity ||
      !activity.participants ||
      activity.participants.length === 0
    ) {
      return false; // No participants, no one to remove
    }

    // Check if the current user is the creator of the activity
    const currentUserId = this.currentUserId;

    // If the current user is the creator AND there are other participants, return true
    const isCreator = +activity.createdById === +currentUserId;
    const otherParticipantsExist = activity.participants.some(
      (participant: any) => +participant.userId !== +currentUserId
    );

    return isCreator && otherParticipantsExist; // Only allow removal if there are other participants
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

  deleteActivity(activityId: number): void {
    if (confirm('Are you sure you want to delete this activity?')) {
      this.activityService.deleteActivity(activityId).subscribe({
        next: () => {
          alert('Activity deleted successfully.');
          this.loadUserActivities(); // Refresh the activities list
        },
        error: (error) => {
          console.error('Error deleting activity:', error);
          alert('Failed to delete activity. Please try again.');
        },
      });
    }
  }
}
