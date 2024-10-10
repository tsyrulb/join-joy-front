import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from './user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'https://your-api-url/api/profile'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Fetch user profile
  getProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`);
  }

  // Update user profile
  updateProfile(userId: string, profileData: UserProfile): Observable<UserProfile> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<UserProfile>(`${this.apiUrl}/${userId}`, profileData, { headers });
  }
}
