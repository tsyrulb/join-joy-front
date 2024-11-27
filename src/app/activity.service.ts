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
  private apiActivityUrl = 'https://localhost:7276/api/Activities';
  private apiUrl = 'https://localhost:7276/api';

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
    return this.http.get<Activity[]>(`${this.apiActivityUrl}`, { headers: this.getAuthHeaders() });
  }
  requestApproval(request: { ActivityId: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Matching/request-approval`, request, { headers: this.getAuthHeaders() });
  }
  
  createActivityWithCoordinates(request: ActivityRequestWithCoordinates): Observable<any> {
    return this.http.post(`${this.apiActivityUrl}/create-with-coordinates`, request, { headers: this.getAuthHeaders() });
  }

  updateActivity(activityId: number, request: Activity): Observable<any> {
    return this.http.put(`${this.apiActivityUrl}/${activityId}`, request, { headers: this.getAuthHeaders() });
  }

  deleteActivity(activityId: number): Observable<any> {
    return this.http.delete(`${this.apiActivityUrl}/${activityId}`, {
      headers: this.getAuthHeaders(),
      responseType: 'text', // Explicitly specify the response type as text
    });
  }

  getUserActivitiesWithParticipants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiActivityUrl}/user-activities`, { headers: this.getAuthHeaders() });
  }

  addUsersToActivity(activityId: number, userIds: number[]): Observable<any> {
    return this.http.post(`${this.apiActivityUrl}/${activityId}/addUsers`, userIds, { headers: this.getAuthHeaders() });
  }
  getRecommendedUsersForActivity(activityId: number, topN: number = 100): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Matching/recommend-users?activityId=${activityId}&topN=${topN}`, { headers: this.getAuthHeaders() });
  }

  fetchRecommendedUsers(activityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Matching/recommend-users?activityId=${activityId}&topN=100`, {
      headers: this.getAuthHeaders(),
    });
  }

  addUser(activityId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiActivityUrl}/${activityId}/addUser`, userId);
  }

  removeUser(activityId: number, userId: number): Observable<any> {
    const url = `${this.apiUrl}/Activities/${activityId}/removeUser`;
    return this.http.delete(url, {
      body: userId,
      headers: this.getAuthHeaders(),
    });
  }
  

  sendInvitations(activityId: number, receiverIds: number[]): Observable<any> {
    const payload = { activityId, receiverIds };
    return this.http.post(`${this.apiUrl}/Matching/send-invitations`, payload, {
      headers: this.getAuthHeaders(),
    });
  }
  
  getRecommendedActivities(userId: number, topN: number = 100): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Matching/recommend-activities?userId=${userId}&topN=${topN}`, { headers: this.getAuthHeaders() });
  }
  
}
