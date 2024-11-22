import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatchingService } from '../matching.service';
import { Match } from '../user.model'; 

@Component({
  selector: 'app-user-matches',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-matches.component.html',
  styleUrls: ['./user-matches.component.css'], // Fixed typo
})
export class UserMatchesComponent implements OnInit {
  createdMatches: Match[] = [];
  receivedMatches: Match[] = [];
  nameid: number = 0;

  constructor(private matchingService: MatchingService) {}

  ngOnInit(): void {
    try {
      this.setUserId();
      if (this.nameid === 0) {
        console.error('Invalid user ID. Ensure the token is valid.');
        return;
      }
      this.fetchUserMatches();
    } catch (error) {
      console.error('Initialization failed:', error.message);
      alert('User is not authenticated. Please log in again.');
    }
  }

  fetchUserMatches(): void {
    this.matchingService.getUserMatches().subscribe({
      next: (matches: Match[]) => {
        console.log(matches);
        console.log('User ID:', this.nameid);

        const userIdNumber = Number(this.nameid); // Convert nameid to a number

        this.createdMatches = matches.filter(
          (match) => match.userId1 === userIdNumber
        );
        this.receivedMatches = matches.filter(
          (match) => match.user2Id === userIdNumber
        );

        console.log('Created Matches:', this.createdMatches);
        console.log('Received Matches:', this.receivedMatches);
      },
      error: (error) => {
        console.error('Error fetching matches:', error);
        alert('Failed to fetch matches. Please try again.');
      },
    });
  }

  acceptInvitation(matchId: number): void {
    this.matchingService.acceptInvitation(matchId).subscribe({
      next: () => {
        alert('Invitation accepted successfully.');
        this.fetchUserMatches(); // Refresh the list after accepting
      },
      error: (error) => {
        console.error('Error accepting invitation:', error);
        alert('Failed to accept invitation. Please try again.');
      },
    });
  }

  private setUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.nameid = tokenPayload.nameid;
        console.log('hello', this.nameid);
        console.log('Extracted userId from token:', this.nameid);
      } catch (e) {
        console.error('Failed to decode token', e);
      }
    } else {
      console.error('Token not found');
    }
  }
}
