import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http'; // Import provideHttpClient
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app/app.routes'; // Import your routes
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()), // Provide the router and enable route input binding
    provideHttpClient(), // Provide HttpClient service globally
    provideAnimations(), // Add this here
  ]
}).catch(err => console.error(err));
