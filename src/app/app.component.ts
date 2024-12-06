import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatTabsModule, MatButtonModule, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'join-joy-front';
  selectedIndex = 0;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.syncTabWithRoute();
      });
  }

  private syncTabWithRoute(): void {
    const routeMap: { [key: string]: number } = {
      '/profile': 0,
      '/user-subcategories': 1,
      '/conversations': 2,
      '/activities': 3,
      '/create-activity': 4,
      '/user-matches': 5,
      '/login': 0,
      '/register': 1,
    };
    const currentRoute = this.router.url.split('?')[0];
    this.selectedIndex = routeMap[currentRoute] ?? 0;
  }

  onTabChange(index: number): void {
    const authenticatedRoutes = [
      '/profile',
      '/user-subcategories',
      '/conversations',
      '/activities',
      '/create-activity',
      '/user-matches',
    ];
    const guestRoutes = ['/login', '/register'];
    const routes = this.isAuthenticated() ? authenticatedRoutes : guestRoutes;
    if (index >= 0 && index < routes.length) {
      this.router.navigate([routes[index]]);
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return tokenPayload.exp > currentTime;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
