import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { User, UpdateUserRequest, Category, Subcategory, UserSubcategory } from './user.model'; // Ensure these models exist
import { Message, Conversation } from './message.model'; // Ensure these models exist
import { environment } from '../environments/environment'; // Adjust path as needed

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = `${environment.apiUrl}/api`;  
  private flaskApiUrl = environment.flaskApiUrl; 

  constructor(private http: HttpClient) {}

  // Helper method to set the Authorization header
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
    });
  }

  updateUserSubcategoriesInFlask(userId: number): Observable<any> {
    return this.http.post(`${this.flaskApiUrl}/update_user_subcategories/${userId}`, {});
  }

  updateUserUnavailabilityInFlask(userId: number): Observable<any> {
    return this.http.post(`${this.flaskApiUrl}/update_user_unavailability/${userId}`, {});
  }

  addNewActivityInFlask(activityId: number): Observable<any> {
    return this.http.post(`${this.flaskApiUrl}/add_new_activity/${activityId}`, {});
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/Category`);
  }

  getSubcategoriesByCategoryId(categoryId: number): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(`${this.apiUrl}/Subcategory/${categoryId}`);
  }

  addUserSubcategory(userId: number, subcategoryId: number, weight: number = 1): Observable<any> {
    const body = [{ subcategoryId, weight }]; // Send as an array
    return this.http.post(`${this.apiUrl}/Users/${userId}/subcategories`, body, { responseType: 'text' });
  }

  getSubcategoryById(subcategoryId: number): Observable<Subcategory> {
    return this.http.get<Subcategory>(`${this.apiUrl}/Subcategory/detail/${subcategoryId}`);
  }

  getUserSubcategories(userId: number): Observable<UserSubcategory[]> {
    return this.http.get<UserSubcategory[]>(`${this.apiUrl}/Users/${userId}/subcategories`);
  }

  removeUserSubcategory(userId: number, subcategoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Users/${userId}/subcategories/${subcategoryId}`, { responseType: 'text' });
  }

  getProfile(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/Users/profile`, { headers });
  }

  registerUser(name: string, email: string, password: string, city: string): Observable<any> {
    const body = { name, email, password, city };
    return this.http.post(`${this.apiUrl}/Users/register`, body, { responseType: 'text' });
  }

  login(username: string, password: string): Observable<any> {
    const body = { email: username, password };
    return this.http.post(`${this.apiUrl}/Users/login`, body).pipe(
      tap((response: any) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          console.log('Login successful, token saved.');
        } else {
          console.error('Login response did not include a token.');
          throw new Error('Invalid login response.');
        }
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => new Error('Login failed. Please check your credentials.'));
      })
    );
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/Users/${userId}`, { headers: this.getAuthHeaders() });
  }

  updateUser(userId: number, user: UpdateUserRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/Users/${userId}/details`, user, { responseType: 'text' });
  }

  uploadUserProfilePhoto(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Users/${userId}/profile-photo`, formData, { headers: this.getAuthHeaders() });
  }

  deleteUserProfilePhoto(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Users/${userId}/profile-photo`, { responseType: 'text' });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/Users`, { headers: this.getAuthHeaders() });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Users/${userId}`, { headers: this.getAuthHeaders() });
  }

  getLocation(userId: number): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/Users/${userId}/location`);
  }

  updateDistance(userId: number, distance: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/Users/${userId}/distance`, { distance }, { headers: this.getAuthHeaders() });
  }

  addUnavailability(data: { dayOfWeek: number; startTime: string; endTime: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/UserUnavailability`, data, { headers: this.getAuthHeaders() });
  }

  removeUnavailability(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/UserUnavailability/${id}`, { headers: this.getAuthHeaders() });
  }

  getUnavailabilities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/UserUnavailability`, { headers: this.getAuthHeaders() });
  }

  getMessagesForConversation(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/Messages/conversation/${conversationId}`, { headers: this.getAuthHeaders() });
  }

  sendMessage(messageData: { content: string; senderId: number; conversationId: number; receiverIds: number[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Messages/send`, messageData, { headers: this.getAuthHeaders() });
  }

  getConversationsForUser(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/Messages/conversations`, { headers: this.getAuthHeaders() });
  }
}
