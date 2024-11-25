import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';
import { Message, Conversation } from '../message.model';
import { ApiService } from '../api.service';
import { User } from '../user.model';
import { CommonModule } from '@angular/common';
import { MessagesComponent } from '../messages/messages.component';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, MessagesComponent],
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css'],
})
export class ConversationsComponent implements OnInit {
  conversations: Conversation[] = [];
  messages: Message[] = []; // To display messages for a selected conversation
  selectedConversationId: number | null = null; // Track the currently selected conversation
  loggedInUserId: number | null = null; // Store the logged-in user ID
  participants: User[] = []; // Track participants of the selected conversation

  constructor(private apiService: ApiService) {}

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
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
      },
    });
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

  // Load messages and participants for the selected conversation
  loadMessagesForConversation(conversationId: number): void {
    this.selectedConversationId = conversationId;

    // Fetch messages for the selected conversation
    this.apiService.getMessagesForConversation(conversationId).subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      },
    });

    // Get participants for the selected conversation
    const selectedConversation = this.conversations.find(
      (conversation) => conversation.id === conversationId
    );
    if (selectedConversation) {
      this.participants = selectedConversation.participants.map(
        (participant) => participant.user
      );
    }
  }
}
