import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class SignalRNotificationService {
  private hubConnection: signalR.HubConnection | null = null;

  // For general notifications
  private notificationSubject = new BehaviorSubject<string | null>(null);
  notifications$ = this.notificationSubject.asObservable();

  // For incoming messages
  private messageReceivedSubject = new BehaviorSubject<any | null>(null);
  messageReceived$ = this.messageReceivedSubject.asObservable();

  constructor() {}

  startConnection(token: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(environment.apiUrl + '/notificationHub', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.on('ReceiveNotification', (message: string) => {
      console.log('Received notification:', message);
      this.notificationSubject.next(message);
    });

    this.hubConnection.on('ReceiveMessage', (message: any) => {
      console.log('Received message:', message);
      this.messageReceivedSubject.next(message);
    });

    return this.hubConnection.start()
      .then(() => {
        console.log('SignalR connection established.');
      })
      .catch(err => {
        console.error('Error establishing SignalR connection:', err);
        return Promise.reject(err);
      });
  }

  stopConnection(): Promise<void> {
    if (this.hubConnection) {
      return this.hubConnection.stop().then(() => {
        console.log('SignalR connection stopped.');
      });
    }
    return Promise.resolve();
  }

  joinConversationGroup(conversationId: number): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('Hub connection is not initialized.');
    }

    return this.hubConnection.invoke('JoinConversationGroup', conversationId)
      .then(() => {
        console.log(`Joined conversation group: ${conversationId}`);
      })
      .catch(err => {
        console.error(`Error joining conversation group ${conversationId}:`, err);
        return Promise.reject(err);
      });
  }

  leaveConversationGroup(conversationId: number): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('Hub connection is not initialized.');
    }

    return this.hubConnection.invoke('LeaveConversationGroup', conversationId)
      .then(() => {
        console.log(`Left conversation group: ${conversationId}`);
      })
      .catch(err => {
        console.error(`Error leaving conversation group ${conversationId}:`, err);
        return Promise.reject(err);
      });
  }
}
