import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

interface User {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [];

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<boolean> {
    // Simulate an API call
    const userExists = this.users.find(user => user.username === username);
    if (userExists) {
      return of(false);
    } else {
      this.users.push({ username, password });
      return of(true);
    }
  }

  login(username: string, password: string): Observable<boolean> {
    const user = this.users.find(u => u.username === username && u.password === password);
    return of(!!user);
  }
}
