import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { MessageService } from '../message.service';
import { Message } from '../message.model';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../user.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit, AfterViewChecked {
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
  
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.setLoggedInUserId();
    this.filteredMessages = [...this.messages];
    this.loadMessages(); // Load messages on component initialization
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private setLoggedInUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.loggedInUserId = Number(tokenPayload.nameid);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }

  filterMessages(): void {
    const query = this.messageSearchQuery.trim().toLowerCase();
    this.filteredMessages = this.messages.filter((message) =>
      message.content.toLowerCase().includes(query)
    );
  }
  
  getUserProfilePicture(userId: number): string {
    const user = this.participants.find(
      (participant) => participant.id === userId
    );
    return user && user.profilePhoto ? user.profilePhoto : 'assets/profile.png';
  }

  isNewDay(index: number): boolean {
    if (index === 0) return true;
  
    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];

    if (!currentMessage?.timestamp) {
      console.log(currentMessage, '1', index, this.filteredMessages);
      return false; // Prevent errors if timestamp is missing
    }
    if (!previousMessage?.timestamp) {
      console.log(previousMessage, '2');
      return false; // Prevent errors if timestamp is missing
    }
    const currentMessageDate = new Date(currentMessage.timestamp).toDateString();
    const previousMessageDate = new Date(previousMessage.timestamp).toDateString();
  
    return currentMessageDate !== previousMessageDate;
  }
  

  getValidDate(date: string | undefined): Date | null {
    if (!date) return null;
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date found:', date);
      return null;
    }
    return parsedDate;
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
    this.isParticipantsVisible = false; // Hide participants if visible
  }

  isDuplicateMessage(index: number): boolean {
    if (index === 0) return false; // Always show the first message
    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];

    return (
      currentMessage.content === previousMessage.content &&
      currentMessage.senderId === previousMessage.senderId
    );
  }

  sendMessage(): void {
    if (!this.newMessageContent.trim() || !this.loggedInUserId) {
      console.error('Message content or user ID missing.');
      return;
    }

    // Explicitly convert to numbers for comparison
    const receiverIds = this.participants
      .filter((participant) => {
        const isReceiver =
          Number(participant.id) !== Number(this.loggedInUserId);
        return isReceiver;
      })
      .map((participant) => Number(participant.id));

    if (receiverIds.length === 0) {
      console.error('No valid recipients for this message.');
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
      error: (error) => console.error('Error sending message:', error),
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
    this.isSearchVisible = false; // Hide search if visible
  }

  private loadMessages(): void {
    this.apiService.getMessagesForConversation(this.conversationId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.filteredMessages = [...this.messages]; // Initialize filtered list
      },
      error: (error) => console.error('Error loading messages:', error),
    });
  }
}
