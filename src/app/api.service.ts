import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UpdateUserRequest } from './user.model'; // Ensure this model exists

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
      Authorization: `Bearer ${token}`,
    });
  }

  // Get profile (assuming the current user)
  getProfile(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/Users/profile`, { headers });
  }

  registerUser(name: string, email: string, password: string): Observable<any> {
    const body = { name, email, password };
    return this.http.post(`${this.apiUrl}/Users/register`, body, { responseType: 'text' });
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
    return this.http.put(`${this.apiUrl}/Users/${userId}/details`, user, { responseType: 'text' });
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


}
