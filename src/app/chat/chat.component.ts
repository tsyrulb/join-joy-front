import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ApiService } from '../api.service';
import { NotificationService } from '../notification.service';
import { SignalRNotificationService } from '../signalr-notification.service';
import { Message, Conversation } from '../message.model';
import { User } from '../user.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [    
    CommonModule,
    FormsModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {
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
  connectionEstablished = false;

  // For messages panel
  newMessageContent = '';
  messageSearchQuery: string = '';
  isSearchVisible = false;
  isParticipantsVisible = false;
  
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private signalRService: SignalRNotificationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.setLoggedInUserId();
    this.loadConversations();

    // Subscribe to incoming messages
    this.signalRService.messageReceived$.subscribe((newMessage: Message) => {
      if (this.selectedConversationId && newMessage.conversationId === this.selectedConversationId) {
        this.filteredMessages = [...this.filteredMessages, newMessage];
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    });

    // Start SignalR connection and set connectionEstablished = true after success
    const token = localStorage.getItem('token');
    if (token) {
      this.signalRService.startConnection(token)
        .then(() => {
          this.connectionEstablished = true;
          console.log('SignalR connection established.');
        })
        .catch(err => console.error('Error starting SignalR connection:', err));
    }
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
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
      this.errorMessage = 'User is not authenticated.';
    }
  }

  loadConversations(): void {
    if (!this.loggedInUserId) {
      return;
    }

    this.apiService.getConversationsForUser().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.filteredConversations = [...this.conversations];
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        this.errorMessage = 'Failed to load conversations. Please try again.';
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
    if (this.selectedConversationId === conversationId) return;

    this.isLoadingMessages = true;
    this.selectedConversationId = conversationId;
    this.filteredMessages = [];
    this.conversationTitle = '';

    // Only join the group if the connection is established
    if (this.connectionEstablished) {
      this.signalRService.joinConversationGroup(conversationId)
        .catch(err => console.error('Error joining conversation group:', err));
    } else {
      console.warn('SignalR connection not established yet. Will join group once established.');
      // Optionally, you could wait or store this conversationId to join later.
    }

    this.apiService.getMessagesForConversation(conversationId).subscribe({
      next: (messages) => {
        this.filteredMessages = messages.filter(
          (message) => message.conversationId === conversationId
        );
        this.isLoadingMessages = false;

        const selectedConversation = this.conversations.find(
          (conv) => conv.id === conversationId
        );
        if (selectedConversation) {
          this.conversationTitle = selectedConversation.title || 'Untitled Conversation';
          this.participants = selectedConversation.participants.map(
            (p) => p.user
          );
        }

        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.errorMessage = 'Failed to load messages. Please try again.';
        this.isLoadingMessages = false;
      },
    });
  }

  scrollToBottom(): void {
    if (this.messagesContainer) {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }, 0);
    }
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
    this.isParticipantsVisible = false;
    if (!this.isSearchVisible) {
      this.messageSearchQuery = '';
    }
  }

  toggleParticipants(): void {
    this.isParticipantsVisible = !this.isParticipantsVisible;
    this.isSearchVisible = false;
  }

  filterMessages(): void {
    const query = this.messageSearchQuery.trim().toLowerCase();
    this.filteredMessages = this.filteredMessages.filter((msg) =>
      msg.content?.toLowerCase().includes(query)
    );
  }

  getUserProfilePicture(userId: number): string {
    const user = this.participants.find((p) => p.id === userId);
    return user && user.profilePhoto ? user.profilePhoto : 'assets/profile.png';
  }

  isNewDay(index: number): boolean {
    if (index === 0) return true;
    const currentMessage = this.filteredMessages[index];
    const previousMessage = this.filteredMessages[index - 1];

    if (!currentMessage?.timestamp || !previousMessage?.timestamp) {
      return false;
    }

    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();

    return currentDate !== previousDate;
  }

  getValidDate(date: string | undefined): Date | null {
    if (!date) return null;
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  getMessageDate(timestamp: string | undefined): string {
    if (!timestamp) return 'Unknown Date';
    const validDate = this.getValidDate(timestamp);
    return validDate ? validDate.toDateString() : 'Unknown Date';
  }

  getMessageTime(date: string | undefined): string {
    const validDate = this.getValidDate(date);
    return validDate
      ? validDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Invalid Time';
  }

  sendMessage(): void {
    if (!this.newMessageContent.trim() || !this.loggedInUserId) {
      this.notificationService.showMessage(
        'Message content or user ID missing.'
      );
      return;
    }

    const receiverIds = this.participants
      .filter((p) => p.id !== this.loggedInUserId)
      .map((p) => p.id);

    if (receiverIds.length === 0) {
      console.error('No valid recipients for this message.');
      this.notificationService.showMessage('No recipients found for this message.');
      return;
    }

    const messageData = {
      content: this.newMessageContent,
      senderId: this.loggedInUserId,
      conversationId: this.selectedConversationId,
      receiverIds,
    };

    this.apiService.sendMessage(messageData).subscribe({
      next: () => {
        this.newMessageContent = '';
        this.reloadMessages();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.notificationService.showMessage('Failed to send message.');
      },
    });
  }

  reloadMessages(): void {
    if (!this.selectedConversationId) return;

    this.apiService.getMessagesForConversation(this.selectedConversationId).subscribe({
      next: (messages) => {
        this.filteredMessages = messages.filter(
          (message) => message.conversationId === this.selectedConversationId
        );
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.notificationService.showMessage('Failed to load messages.');
      },
    });
  }

  getUserNameById(userId: number): string | null {
    const participant = this.participants.find((p) => p.id === userId);
    return participant ? participant.name : null;
  }
}
