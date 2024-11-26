import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private apiUrl = 'https://localhost:7276/api/Feedback';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
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
