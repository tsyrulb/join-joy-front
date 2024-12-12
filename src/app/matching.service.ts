import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class MatchingService {
  private apiUrl = `${environment.apiUrl}/api/matching`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('User is not authenticated. Token is missing.');
      throw new Error('User is not authenticated. Please log in again.');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getUserMatches(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-matches`, {
      headers: this.getAuthHeaders(),
    });
  }

  acceptInvitation(matchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/accept-invitation/${matchId}`, null, {
      headers: this.getAuthHeaders(),
    });
  }

  cancelInvitation(matchId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel-invitation/${matchId}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
