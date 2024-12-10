import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment'; // Adjust the path as necessary

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private apiUrl = `${environment.apiUrl}/api/Feedback`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  submitFeedback(feedbackRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, feedbackRequest, {
      headers: this.getAuthHeaders(),
    });
  }
}
