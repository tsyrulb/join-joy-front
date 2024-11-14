import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  UpdateUserRequest,
  Category,
  Subcategory,
  UserSubcategory,
} from './user.model'; // Ensure this model exists
import {
  Message,
  Conversation,
} from './message.model'; // Ensure this model exists

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://localhost:7276/api'; // Base API URL

  constructor(private http: HttpClient) {}

  // Helper method to set the Authorization header
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
        Authorization: `Bearer ${token}`
    });
}


  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/Category`);
  }

  // Get subcategories by category ID
  getSubcategoriesByCategoryId(categoryId: number): Observable<Subcategory[]> {
    return this.http.get<Subcategory[]>(
      `${this.apiUrl}/Subcategory/${categoryId}`
    );
  }

  addUserSubcategory(
    userId: number,
    subcategoryId: number,
    weight: number = 1
  ): Observable<any> {
    const body = [{ subcategoryId, weight }]; // Send as an array
    return this.http.post(
      `${this.apiUrl}/Users/${userId}/subcategories`,
      body,
      { responseType: 'text' }
    );
  }

  getSubcategoryById(subcategoryId: number): Observable<Subcategory> {
    return this.http.get<Subcategory>(
      `${this.apiUrl}/Subcategory/detail/${subcategoryId}`
    );
  }
  getUserSubcategories(userId: number): Observable<UserSubcategory[]> {
    return this.http.get<UserSubcategory[]>(
      `${this.apiUrl}/Users/${userId}/subcategories`
    );
  }
  // Remove a user subcategory
  removeUserSubcategory(
    userId: number,
    subcategoryId: number
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/Users/${userId}/subcategories/${subcategoryId}`,
      { responseType: 'text' }
    );
  }
  // Get profile (assuming the current user)
  getProfile(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/Users/profile`, { headers });
  }

  registerUser(name: string, email: string, password: string): Observable<any> {
    const body = { name, email, password };
    return this.http.post(`${this.apiUrl}/Users/register`, body, {
      responseType: 'text',
    });
  }

  // Log in a user
  login(username: string, password: string): Observable<any> {
    const body = { email: username, password }; // Send as JSON body
    return this.http.post(`${this.apiUrl}/Users/login`, body);
  }

  // Get user details by ID
  getUser(userId: number): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/Users/${userId}`, { headers });
  }

  // Update user details
  // Update the updateUser method in api.service.ts
  updateUser(userId: number, user: UpdateUserRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/Users/${userId}/details`, user, {
      responseType: 'text',
    });
  }

  uploadUserProfilePhoto(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/Users/${userId}/profile-photo`, formData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
}


  deleteUserProfilePhoto(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Users/${userId}/profile-photo`, {
      responseType: 'text',
    });
  }
  // Get all users
  getAllUsers(): Observable<User[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/Users`, { headers });
  }

  // Delete a user by ID
  deleteUser(userId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/Users/${userId}`, { headers });
  }
  // Get user details by ID
  getLocation(userId: number): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/Users/${userId}/location`);
  }

  // Set user availability
  setAvailability(
    userId: number,
    unavailableDay: string,
    unavailableStartTime: string,
    unavailableEndTime: string
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = {
      unavailableDay,
      unavailableStartTime,
      unavailableEndTime,
    };
    return this.http.post(
      `${this.apiUrl}/Users/${userId}/set-availability`,
      body,
      { headers }
    );
  }

  // Update distance willing to travel
  updateDistance(userId: number, distance: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.apiUrl}/Users/${userId}/distance`,
      { distance },
      { headers }
    );
  }

  // Check user availability
  checkUserAvailability(userId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/Users/${userId}/availability`, {
      headers,
    });
  }

  getMessagesForConversation(conversationId: number): Observable<Message[]> {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    return this.http.get<Message[]>(`${this.apiUrl}/Messages/conversation/${conversationId}`, { headers });
  }
  
  
  sendMessage(messageData: { content: string; senderId: number; conversationId: number; receiverIds: number[] }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return this.http.post(`${this.apiUrl}/Messages/send`, messageData, { headers });
  }
  

  getConversationsForUser(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/Messages/conversations`, {
        headers: this.getAuthHeaders()
    });
}

  
}
