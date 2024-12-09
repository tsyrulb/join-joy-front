import { Component, OnInit } from '@angular/core';
import { ActivityService } from '../activity.service';
import { CommonModule } from '@angular/common';
import { GoogleSearchService } from '../google-search.service';
import { FeedbackService } from '../feedback.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.css'],
})
export class ActivitiesComponent implements OnInit {
  activities: any[] = [];
  currentUserId: number = 0;
  defaultImageUrl = './assets/images/image.png';
  activityImages: { [key: string]: string } = {};
  visibleActionsIndex: number | null = null; // Index of the participant whose actions are visible

  // Recommended Users Modal State
  isRecommendedUsersModalVisible = false;
  recommendedUsers: any[] = [];
  visibleUsers: any[] = [];
  excludedUsers: any[] = [];

  // Feedback Modal State
  isFeedbackModalVisible = false;
  feedbackType: 'user' | 'activity' | null = null;
  feedbackData = {
    rating: 1,
    activityId: null,
    targetUserId: null,
  };

  createdActivityId: number | null = null;
  currentActivityForInvitations: number | null = null; // Store activity ID for invitations
  showInvitationSuccess = false; // For success animation

  activityFormData = {
    name: '',
    description: '',
    date: '',
    time: '',
    latitude: 0,
    longitude: 0,
  };

  constructor(
    private activityService: ActivityService,
    private googleSearchService: GoogleSearchService,
    private feedbackService: FeedbackService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.setUserId();
    this.loadUserActivities();
  }

  // Toggle visibility for a specific activity and participant
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
      },
    });
  }

  openFeedbackModal(
    activityId: number,
    targetUserId: number | null,
    type: 'user' | 'activity'
  ): void {
    console.log('Opening feedback modal:', { activityId, targetUserId, type });
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
        // Feedback sent automatically
      },
      error: (error) => {
        console.error('Error sending feedback:', error);
        this.notificationService.showMessage(
          'Failed to send feedback. Please try again.'
        );
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
      this.notificationService.showMessage(
        'Please select a valid rating between 1 and 5.'
      );
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
        this.notificationService.showMessage(
          'Feedback submitted successfully.'
        );
        this.closeFeedbackModal();
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        this.notificationService.showMessage('Failed to submit feedback.');
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
          this.notificationService.showMessage(
            response.message || 'Participant removed successfully!'
          );
          this.loadUserActivities(); // Refresh activities
        },
        error: (error) => {
          console.error('Error removing participant:', error);
          this.notificationService.showMessage(
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
    if (!activityId) {
      this.notificationService.showMessage('No valid activity selected.');
      return;
    }

    // Fetch recommended users for the selected activity
    this.activityService.getRecommendedUsersForActivity(activityId, this.currentUserId).subscribe({
      next: (recommendedUsers) =>
        this.showRecommendedUsers(recommendedUsers, activityId),
      error: (error) => {
        console.error('Error fetching recommended users:', error);
        this.notificationService.showMessage(
          'Failed to fetch recommended users. See console for details.'
        );
      },
    });
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
          this.notificationService.showMessage(
            'Activity deleted successfully.'
          );
          this.loadUserActivities(); // Refresh the activities list
        },
        error: (error) => {
          console.error('Error deleting activity:', error);
          this.notificationService.showMessage(
            'Failed to delete activity. Please try again.'
          );
        },
      });
    }
  }

  fetchRecommendedUsers(activityId: number): void {
    this.activityService
      .getRecommendedUsersForActivity(activityId, this.currentUserId)
      .subscribe({
        next: (users) => {
          console.log('Recommended users:', users);
          this.showRecommendedUsers(users, activityId);
        },
        error: (error) => {
          console.error('Error fetching recommended users:', error);
          this.notificationService.showMessage(
            'Failed to fetch recommended users.'
          );
        },
      });
  }

  showRecommendedUsers(users: any[], activityId: number): void {
    if (!users || users.length === 0) {
      console.warn('No recommended users found.');
      this.recommendedUsers = [];
      this.visibleUsers = [];
      this.isRecommendedUsersModalVisible = false;
      return;
    }

    this.recommendedUsers = users.map((user) => ({
      ...user,
      selected: false,
    }));

    this.excludedUsers = []; // Clear excluded users when fetching new recommendations
    // Initialize the top 10 users as visible
    this.visibleUsers = this.recommendedUsers.slice(0, 10);
    this.isRecommendedUsersModalVisible = true;

    // Store the current activity ID for sending invitations later
    this.currentActivityForInvitations = activityId;
  }

  closeRecommendedUsersModal(): void {
    this.isRecommendedUsersModalVisible = false;
  }

  isAnyUserSelected(): boolean {
    return this.visibleUsers.some((user) => user.selected);
  }

  sendSelectedInvitations(): void {
    const selectedUsers = this.recommendedUsers.filter((user) => user.selected);
    const receiverIds = selectedUsers.map((user) => user.userId);

    if (receiverIds.length === 0) {
      this.notificationService.showMessage('No users selected for invitation.');
      return;
    }

    // Instead of using this.createdActivityId, use the stored activity ID
    if (!this.currentActivityForInvitations) {
      this.notificationService.showMessage(
        'Activity ID is missing. Cannot send invitations.'
      );
      return;
    }

    this.activityService
      .sendInvitations(this.currentActivityForInvitations, receiverIds)
      .subscribe({
        next: () => {
          this.isRecommendedUsersModalVisible = false;
          // Trigger success animation
          this.showInvitationSuccess = true;
          setTimeout(() => {
            this.showInvitationSuccess = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Error sending invitations:', error);
          this.notificationService.showMessage(
            'Failed to send invitations. See console for details.'
          );
        },
      });
  }

  excludeUser(index: number, event: MouseEvent): void {
    event.preventDefault(); // Prevent the default context menu

    // Remove the excluded user from the visible list
    const excludedUser = this.visibleUsers.splice(index, 1)[0];
    this.excludedUsers.push(excludedUser); // Add to excluded users list

    // Find the next user from the full list who is not currently visible or excluded
    const remainingUsers = this.recommendedUsers.filter(
      (user) =>
        !this.visibleUsers.includes(user) && !this.excludedUsers.includes(user)
    );

    if (remainingUsers.length > 0) {
      this.visibleUsers.push(remainingUsers[0]);
    } else {
      console.warn('No more users to add.');
    }

    console.log(`Excluded user: ${excludedUser.userName}`);
    console.log('Updated visible users:', this.visibleUsers);
    console.log('Excluded users:', this.excludedUsers);
  }

  toggleUserSelection(index: number): void {
    this.visibleUsers[index].selected = !this.visibleUsers[index].selected;
  }
}
