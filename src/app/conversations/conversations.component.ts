import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MessageService } from '../message.service';
import { Message, Conversation } from '../message.model';
import { ApiService } from '../api.service';
import { User } from '../user.model';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from '../messages/messages.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, MessagesComponent, FormsModule],
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css'],
})
export class ConversationsComponent implements OnInit {
  conversations: Conversation[] = [];
  messages: Message[] = []; // To display messages for a selected conversation
  selectedConversationId: number | null = null; // Track the currently selected conversation
  loggedInUserId: number | null = null; // Store the logged-in user ID
  participants: User[] = []; // Track participants of the selected conversation
  filteredConversations: Conversation[] = []; // Filtered conversations for display
  searchQuery: string = ''; // Search query for filtering conversations
  isLoadingMessages = false;
  filteredMessages: Message[] = [];
  conversationTitle: string = 'Conversation Title';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setLoggedInUserId();
    this.loadConversations();
  }

  // Retrieve the logged-in user ID from the token
  private setLoggedInUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      this.loggedInUserId = tokenPayload.nameid;
    }
  }

  // Load conversations for the logged-in user
  loadConversations(): void {
    this.apiService.getConversationsForUser().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.filteredConversations = [...this.conversations]; // Initialize filtered list
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
      },
    });
  }

  getMaxVisibleParticipants(): number {
    // Estimate the maximum number of participants to fit in one line
    const averageCharWidth = 10; // Adjust based on expected font size
    const maxLineWidth = 250; // Maximum width in pixels for the line
    return Math.floor(maxLineWidth / averageCharWidth);
  }
  
  filterConversations(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredConversations = this.conversations.filter((conversation) =>
      conversation.participants.some((participant) =>
        participant.user.name.toLowerCase().includes(query)
      )
    );
  }

  getReceiverName(participants: { userId: number; user: User }[]): string {
    if (!this.loggedInUserId || !participants || participants.length === 0) {
      return 'Unknown';
    }

    const receiver = participants.find(
      (participant) => participant.userId !== this.loggedInUserId
    );

    return receiver?.user?.name || 'Unknown';
  }

  loadMessagesForConversation(conversationId: number): void {
    this.isLoadingMessages = true;
    this.selectedConversationId = conversationId;
    this.messages = [];
    this.participants = [];
    this.filteredMessages = []; // Clear previous messages
    this.conversationTitle = '';
    this.apiService.getMessagesForConversation(conversationId).subscribe({
      next: (messages) => {
        if (this.selectedConversationId === conversationId) {
          this.filteredMessages = messages.filter(
            (message) => message.conversationId === conversationId
          );
          }
        this.isLoadingMessages = false;
      
      },
      error: (error) => {
        console.error('Error loading messages:', error);
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
