import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from './auth.guard';  // Import the authGuard
import { CategoriesComponent } from './categories/categories.component';
import { UserSubcategoriesComponent } from './user-subcategories/user-subcategories.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },  // Protect the profile route
  { path: 'categories', component: CategoriesComponent },
  { path: 'user-subcategories', component: UserSubcategoriesComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
