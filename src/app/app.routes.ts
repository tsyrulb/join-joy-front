import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard, guestGuard } from './auth.guard'; // Import both guards
import { CategoriesComponent } from './categories/categories.component';
import { UserSubcategoriesComponent } from './user-subcategories/user-subcategories.component';
import { ConversationsComponent } from './conversations/conversations.component';
import { MessagesComponent } from './messages/messages.component';
import { ActivitiesComponent } from './activities/activities.component';
import { ActivityMapComponent } from './activity-map/activity-map.component';
import { UserMatchesComponent } from './user-matches/user-matches.component';

export const routes: Routes = [
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'user-subcategories',
    loadComponent: () =>
      import('./user-subcategories/user-subcategories.component').then(
        (m) => m.UserSubcategoriesComponent
      ),
  },
  {
    path: 'conversations',
    loadComponent: () =>
      import('./conversations/conversations.component').then((m) => m.ConversationsComponent),
  },
  {
    path: 'activities',
    loadComponent: () =>
      import('./combined-page-component/combined-page-component.component').then((m) => m.CombinedPageComponentComponent),
  },
  {
    path: 'create-activity',
    loadComponent: () =>
      import('./activity-map/activity-map.component').then((m) => m.ActivityMapComponent),
  },
  {
    path: 'user-matches',
    loadComponent: () =>
      import('./user-matches/user-matches.component').then((m) => m.UserMatchesComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    redirectTo: '/profile',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/profile',
  },
];
