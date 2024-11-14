import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, Conversation } from './message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'https://localhost:7276/api/messages'; // Adjust as per your backend URL

  constructor(private http: HttpClient) {}

  sendMessage(message: Message): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, message);
  }

  getMessagesForConversation(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversation/${conversationId}`);
  }

  markMessagesAsRead(conversationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/mark-read/${conversationId}`, {});
  }

  getConversationsForUser(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${messageId}`);
  }

  deleteConversation(conversationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/conversation/${conversationId}`);
  }
}
