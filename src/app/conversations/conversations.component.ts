import { Component, OnInit, ChangeDetectorRef, } from '@angular/core';
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
import { SignalRNotificationService } from '../signalr-notification.service';

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
    MatProgressSpinnerModule,
  ],
  templateUrl: './conversations.component.html',
  styleUrls: ['../chat-window.css'],
})
export class ConversationsComponent implements OnInit {
  conversations: Conversation[] = [];
  selectedConversationId: number | null = null;
  loggedInUserId: number | null = null;
  participants: User[] = [];
  filteredConversations: Conversation[] = [];
  searchQuery: string = '';
  isLoadingMessages = false;
  filteredMessages: Message[] = [];
  conversationTitle: string = 'Conversation Title';
  errorMessage: string = '';

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private signalRService: SignalRNotificationService
  ) {}

  ngOnInit(): void {
    this.setLoggedInUserId();
    this.loadConversations();

    // Subscribe to incoming messages from SignalR
    this.signalRService.messageReceived$.subscribe((newMessage: Message) => {
      // If the incoming message belongs to the currently selected conversation, append it
      if (this.selectedConversationId && newMessage.conversationId === this.selectedConversationId) {
        this.filteredMessages = [...this.filteredMessages, newMessage];
        // Trigger change detection to update the view
        this.cdr.detectChanges();
      }
    });

    // Start the SignalR connection after login
    const token = localStorage.getItem('token');
    if (token) {
      this.signalRService.startConnection(token)
        .catch(err => console.error('Error starting SignalR connection:', err));
    }
  }

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

  loadConversations(): void {
    if (!this.loggedInUserId) {
      console.error('User ID is not set.');
      return;
    }

    this.apiService.getConversationsForUser().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.filteredConversations = [...this.conversations];
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.errorMessage = 'Failed to load conversations. Please try again later.';
      },
    });
  }

  filterConversations(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredConversations = this.conversations.filter((conversation) =>
      conversation.participants.some((participant) =>
        participant.user.name.toLowerCase().includes(query)
      )
    );
  }

  getConversationParticipants(conversation: Conversation): string {
    return conversation.participants
      .map((participant) => participant.user.name)
      .join(', ');
  }

  getMaxVisibleParticipants(): number {
    return 3;
  }

  loadMessagesForConversation(conversationId: number): void {
    if (this.selectedConversationId === conversationId) {
      return;
    }

    this.isLoadingMessages = true;
    this.selectedConversationId = conversationId;
    this.filteredMessages = [];
    this.conversationTitle = '';

    // Join the conversation group using SignalR so that we receive real-time updates
    this.signalRService.joinConversationGroup(conversationId)
      .catch(err => console.error('Error joining conversation group:', err));

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
