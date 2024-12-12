import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard, guestGuard } from './auth.guard';
import { UserSubcategoriesComponent } from './user-subcategories/user-subcategories.component';
import { ConversationsComponent } from './conversations/conversations.component';
import { ActivitiesComponent } from './activities/activities.component';
import { ActivityMapComponent } from './activity-map/activity-map.component';
import { UserMatchesComponent } from './user-matches/user-matches.component';

export const routes: Routes = [
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard], 
  },
  {
    path: 'user-subcategories',
    loadComponent: () =>
      import('./user-subcategories/user-subcategories.component').then(
        (m) => m.UserSubcategoriesComponent
      ),
    canActivate: [authGuard], 
  },
  {
    path: 'conversations',
    loadComponent: () =>
      import('./chat/chat.component').then((m) => m.ChatComponent),
    canActivate: [authGuard],
  },
  {
    path: 'activities',
    loadComponent: () =>
      import('./combined-page-component/combined-page-component.component').then(
        (m) => m.CombinedPageComponentComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'create-activity',
    loadComponent: () =>
      import('./activity-map/activity-map.component').then(
        (m) => m.ActivityMapComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'user-matches',
    loadComponent: () =>
      import('./user-matches/user-matches.component').then(
        (m) => m.UserMatchesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard], 
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
