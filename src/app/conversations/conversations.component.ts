// conversations.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../api.service';
import { Message, Conversation } from '../message.model';
import { User } from '../user.model';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from '../messages/messages.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [
    CommonModule,
    MessagesComponent,
    FormsModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule, // Added for loading spinner
  ],
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css'],
})
export class ConversationsComponent implements OnInit {
  conversations: Conversation[] = [];
  selectedConversationId: number | null = null; // Track the currently selected conversation
  loggedInUserId: number | null = null; // Store the logged-in user ID
  participants: User[] = []; // Track participants of the selected conversation
  filteredConversations: Conversation[] = []; // Filtered conversations for display
  searchQuery: string = ''; // Search query for filtering conversations
  isLoadingMessages = false;
  filteredMessages: Message[] = [];
  conversationTitle: string = 'Conversation Title';
  errorMessage: string = ''; // To display error messages
   
  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}
   
  ngOnInit(): void {
    this.setLoggedInUserId();
    this.loadConversations();
  }
   
  // Retrieve the logged-in user ID from the token
  private setLoggedInUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.loggedInUserId = tokenPayload.nameid;
      } catch (error) {
        console.error('Error parsing token:', error);
        this.errorMessage = 'Invalid authentication token.';
      }
    } else {
      console.error('No token found in localStorage.');
      this.errorMessage = 'User is not authenticated.';
    }
  }
   
  // Load conversations for the logged-in user
  loadConversations(): void {
    if (!this.loggedInUserId) {
      console.error('User ID is not set.');
      return;
    }
   
    // Updated method call without parameters
    this.apiService.getConversationsForUser().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.filteredConversations = [...this.conversations]; // Initialize filtered list
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.errorMessage = 'Failed to load conversations. Please try again later.';
      },
    });
  }
   
  // Filter conversations based on the search query
  filterConversations(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredConversations = this.conversations.filter((conversation) =>
      conversation.participants.some((participant) =>
        participant.user.name.toLowerCase().includes(query)
      )
    );
  }
   
  // Get concatenated participant names for display
  getConversationParticipants(conversation: Conversation): string {
    return conversation.participants
      .map((participant) => participant.user.name)
      .join(', ');
  }
   
  // Determine the maximum number of visible participants before truncating
  getMaxVisibleParticipants(): number {
    return 3; // Adjust based on design preference
  }
   
  // Load messages for a selected conversation
  loadMessagesForConversation(conversationId: number): void {
    if (this.selectedConversationId === conversationId) {
      // If the same conversation is clicked again, do nothing or toggle selection
      return;
    }
   
    this.isLoadingMessages = true;
    this.selectedConversationId = conversationId;
    this.filteredMessages = []; // Clear previous messages
    this.conversationTitle = '';
   
    // Fetch messages for the selected conversation
    this.apiService.getMessagesForConversation(conversationId).subscribe({
      next: (messages) => {
        this.filteredMessages = messages.filter(
          (message) => message.conversationId === conversationId
        );
        this.isLoadingMessages = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.errorMessage = 'Failed to load messages. Please try again later.';
        this.isLoadingMessages = false;
      },
    });
   
    // Set conversation title and participants
    const selectedConversation = this.conversations.find(
      (conversation) => conversation.id === conversationId
    );
   
    if (selectedConversation) {
      this.conversationTitle = selectedConversation.title || 'Untitled Conversation';
      this.participants = selectedConversation.participants.map(
        (participant) => participant.user
      );
    }
  }
}
