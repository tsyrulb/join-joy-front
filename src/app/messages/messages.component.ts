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
  newMessageContent = '';
  loggedInUserId: number | null = null;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.setLoggedInUserId();
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
        console.log('Logged in user ID:', this.loggedInUserId);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
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
        console.log(
          `Checking participant ID: ${participant.id} (Is receiver: ${isReceiver})`
        );
        return isReceiver;
      })
      .map((participant) => Number(participant.id));

    console.log('Participants:', this.participants);
    console.log('Logged-in User ID:', this.loggedInUserId);
    console.log('Sender ID:', this.loggedInUserId);
    console.log('Receiver IDs after filtering:', receiverIds);

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

  private loadMessages(): void {
    this.apiService.getMessagesForConversation(this.conversationId).subscribe({
      next: (messages) => (this.messages = messages),
      error: (error) => console.error('Error loading messages:', error),
    });
  }
}
