import { Component, OnInit, Input } from '@angular/core';
import { MessageService } from '../message.service';
import { Message } from '../message.model';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../user.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit {
  @Input() conversationId!: number;
  @Input() messages: Message[] = [];
  @Input() participants: User[] = [];
  newMessageContent = '';
  loggedInUserId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.setLoggedInUserId();
  }

  private setLoggedInUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      this.loggedInUserId = tokenPayload.nameid;
    }
  }

  sendMessage(): void {
    if (!this.newMessageContent.trim() || !this.loggedInUserId) {
      console.error("Message content or user ID missing.");
      return;
    }
    const participants = this.participants;
    // Ensure only participants who are not the logged-in user are included in receiverIds
    const receiverId = participants.findIndex(participant => participant.id === this.loggedInUserId);
    if (receiverId !== -1) {
      participants.splice(receiverId, 1);
    }
    const receiverIds = participants.map(participant => participant.id);

    console.log("Sender ID:", this.loggedInUserId);
    console.log("Receiver IDs after filtering:", receiverIds); // Debugging output

    if (receiverIds.length === 0) {
      console.error('No valid recipients for this message.');
      return;
    }

    const messageData = {
      content: this.newMessageContent,
      senderId: this.loggedInUserId,
      conversationId: this.conversationId,
      receiverIds: [7],
    };

    this.apiService.sendMessage(messageData).subscribe({
      next: () => {
        this.newMessageContent = '';
        this.loadMessages(); // Reload messages after sending
      },
      error: (error) => console.error('Error sending message:', error),
    });
  }

  private loadMessages(): void {
    this.apiService.getMessagesForConversation(this.conversationId).subscribe({
      next: (messages) => (this.messages = messages),
      error: (error) => console.error('Error loading messages:', error),
    });
  }
}
