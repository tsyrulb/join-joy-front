// activity.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Activity {
  id: number;
  name: string;
  description?: string;
  date: string;
  locationId: number;
  createdById: number;
}

interface ActivityRequestWithCoordinates {
  name: string;
  description: string;
  date: string;
  latitude: number;
  longitude: number;
  createdById: number;
}

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private apiUrl = 'https://localhost:7276/api/Activities';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
  getNearbyPlaces(latitude: number, longitude: number, userInput: string): Observable<any> {
    const url = `https://localhost:7276/api/places/nearby-all`;
    const body = { Latitude: latitude, Longitude: longitude, UserInput: userInput, Radius: 5000 };
    return this.http.post(url, body, { headers: this.getAuthHeaders() });
  }
  
  getAllActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  createActivityWithCoordinates(request: ActivityRequestWithCoordinates): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-with-coordinates`, request, { headers: this.getAuthHeaders() });
  }

  updateActivity(activityId: number, request: Activity): Observable<any> {
    return this.http.put(`${this.apiUrl}/${activityId}`, request, { headers: this.getAuthHeaders() });
  }

  deleteActivity(activityId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${activityId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text', // Explicitly specify the response type as text
    });
  }
  

  addUsersToActivity(activityId: number, userIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${activityId}/addUsers`, userIds, { headers: this.getAuthHeaders() });
  }
}
