import { Component } from '@angular/core';
import { ActivitiesComponent } from '../activities/activities.component';
import { UserMatchesComponent } from '../user-matches/user-matches.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-combined-page-component',
  standalone: true,
  imports: [ActivitiesComponent,
            UserMatchesComponent,
            FormsModule,
            CommonModule,
            MatIconModule],
  templateUrl: './combined-page-component.component.html',
  styleUrls: ['./combined-page-component.component.css']
})
export class CombinedPageComponentComponent {
  isSidebarOpen = false;
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
