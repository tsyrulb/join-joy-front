import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ApiService } from '../api.service';
import { NotificationService } from '../notification.service';
import { Message } from '../message.model';
import { User } from '../user.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './messages.component.html',
  styleUrls: ['../chat-window.css'],
})
export class MessagesComponent implements OnInit, AfterViewChecked, OnChanges {
  @Input() conversationId!: number;
  @Input() messages: Message[] = [];
  @Input() participants: User[] = [];
  @Input() conversationTitle: string = '';

  newMessageContent = '';
  loggedInUserId: number | null = null;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  messageSearchQuery: string = '';
  filteredMessages: Message[] = [];
  isSearchVisible = false;
  isParticipantsVisible = false;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.setLoggedInUserId();
    this.filteredMessages = [...this.messages];
    this.loadMessages();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && !changes['messages'].firstChange) {
      const prev = changes['messages'].previousValue as Message[];
      const curr = changes['messages'].currentValue as Message[];
  
      // Check if a new message was added at the end
      if (curr.length > prev.length && curr[curr.length - 1].senderId) {
        this.scrollToBottom();
      }
    }
  }

  ngAfterViewChecked(): void {

  }

  private setLoggedInUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.loggedInUserId = Number(tokenPayload.nameid);
      } catch (error) {
        console.error('Error parsing token:', error);
        this.notificationService.showMessage(
          'Error decoding user ID from token.'
        );
      }
    }
  }

  filterMessages(): void {
    const query = this.messageSearchQuery.trim().toLowerCase();
    this.filteredMessages = this.messages.filter((message) =>
      message.content?.toLowerCase().includes(query)
    );
  }

  getUserProfilePicture(userId: number): string {
    const user = this.participants.find((p) => p.id === userId);
    return user && user.profilePhoto ? user.profilePhoto : 'assets/profile.png';
  }

  isNewDay(index: number): boolean {
    if (index === 0) return true;
    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];

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

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
    this.isParticipantsVisible = false;
    if (!this.isSearchVisible) {
      this.messageSearchQuery = '';
      this.filteredMessages = [...this.messages];
    }
  }

  isDuplicateMessage(index: number): boolean {
    if (index === 0) return false;
    const current = this.messages[index];
    const prev = this.messages[index - 1];
    return (
      current.content === prev.content && current.senderId === prev.senderId
    );
  }

  sendMessage(): void {
    if (!this.newMessageContent.trim() || !this.loggedInUserId) {
      this.notificationService.showMessage(
        'Message content or user ID missing.'
      );
      return;
    }

    const receiverIds = this.participants
      .filter((p) => Number(p.id) !== Number(this.loggedInUserId))
      .map((p) => Number(p.id));

    if (receiverIds.length === 0) {
      console.error('No valid recipients for this message.');
      this.notificationService.showMessage(
        'No recipients found for this message.'
      );
      return;
    }

    const messageData = {
      content: this.newMessageContent,
      senderId: this.loggedInUserId,
      conversationId: this.conversationId,
      receiverIds,
    };

    this.apiService.sendMessage(messageData).subscribe({
      next: () => {
        this.newMessageContent = '';
        this.loadMessages(); // Reload messages after sending
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.notificationService.showMessage('Failed to send message.');
      },
    });
  }

  getUserNameById(userId: number): string | null {
    const participant = this.participants.find((p) => p.id === userId);
    return participant ? participant.name : null;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  toggleParticipants(): void {
    this.isParticipantsVisible = !this.isParticipantsVisible;
    this.isSearchVisible = false;
  }

  private loadMessages(): void {
    if (!this.conversationId) {
      console.warn('No conversationId provided to load messages.');
      return;
    }

    this.apiService.getMessagesForConversation(this.conversationId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.filteredMessages = [...this.messages];
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.notificationService.showMessage('Failed to load messages.');
      },
    });
  }
}
