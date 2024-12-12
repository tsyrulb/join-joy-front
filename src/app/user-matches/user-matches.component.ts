import { Component, OnInit } from '@angular/core';
import { MatchingService } from '../matching.service';
import { Match } from '../user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-matches',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatExpansionModule,
    MatTabsModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-matches.component.html',
  styleUrls: ['./user-matches.component.css'],
})
export class UserMatchesComponent implements OnInit {
  createdMatches: Match[] = [];
  receivedMatches: Match[] = [];
  filteredCreatedMatches: Match[] = [];
  filteredReceivedMatches: Match[] = [];
  nameid: number = 0;
  createdSearch: string = '';
  receivedSearch: string = '';

  // Add this line to define selectedTab
  selectedTab: string = 'created'; // default tab can be 'created' or 'received'

  constructor(
    private matchingService: MatchingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    try {
      this.setUserId();
      if (this.nameid === 0) {
        console.error('Invalid user ID. Ensure the token is valid.');
        return;
      }
      this.fetchUserMatches();
    } catch (error: any) {
      console.error('Initialization failed:', error.message);
      this.notificationService.showMessage(
        'User is not authenticated. Please log in again.'
      );
    }
  }

  fetchUserMatches(): void {
    this.matchingService.getUserMatches().subscribe({
      next: (matches: Match[]) => {
        const userIdNumber = Number(this.nameid);
        this.createdMatches = matches.filter(
          (match) => match.userId1 === userIdNumber
        );
        this.receivedMatches = matches.filter(
          (match) => match.user2Id === userIdNumber
        );

        this.filteredCreatedMatches = [...this.createdMatches];
        this.filteredReceivedMatches = [...this.receivedMatches];
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
      },
    });
  }

  acceptInvitation(matchId: number): void {
    this.matchingService.acceptInvitation(matchId).subscribe({
      next: () => {
        this.notificationService.showMessage(
          'Invitation accepted successfully.'
        );
        this.fetchUserMatches();
      },
      error: (error) => {
        console.error('Error accepting invitation:', error);
        this.notificationService.showMessage(
          'Failed to accept invitation. Please try again.'
        );
      },
    });
  }

  cancelInvitation(matchId: number): void {
    this.matchingService.cancelInvitation(matchId).subscribe({
      next: () => {
        this.notificationService.showMessage(
          'Invitation canceled successfully.'
        );
        this.fetchUserMatches(); // Refresh the list after canceling
      },
      error: (error) => {
        console.error('Error canceling invitation:', error);
        this.notificationService.showMessage(
          'Failed to cancel invitation. Please try again.'
        );
      },
    });
  }

  filterCreatedMatches(): void {
    this.filteredCreatedMatches = this.createdMatches.filter(
      (match) =>
        match.activity?.name
          ?.toLowerCase()
          .includes(this.createdSearch.toLowerCase()) ||
        match.user2?.name
          ?.toLowerCase()
          .includes(this.createdSearch.toLowerCase())
    );
  }

  filterReceivedMatches(): void {
    this.filteredReceivedMatches = this.receivedMatches.filter(
      (match) =>
        match.activity?.name
          ?.toLowerCase()
          .includes(this.receivedSearch.toLowerCase()) ||
        match.user1?.name
          ?.toLowerCase()
          .includes(this.receivedSearch.toLowerCase())
    );
  }

  private setUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.nameid = tokenPayload.nameid;
      } catch (e) {
        console.error('Failed to decode token', e);
      }
    } else {
      console.error('Token not found');
    }
  }
}
