import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../activity.service';
import { ApiService } from '../api.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
@Component({
  selector: 'app-activity-map',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './activity-map.component.html',
  styleUrls: ['./activity-map.component.css'],
})
export class ActivityMapComponent implements OnDestroy {
  @Output() locationSelected = new EventEmitter<{
    latitude: number;
    longitude: number;
  }>();
  private map: L.Map | undefined;
  private markers = new L.LayerGroup();
  private selectedMarker: L.Marker | null = null;
  isRecommendedUsersModalVisible = false;
  recommendedActivities: any[] = []; // List of recommended activities
  recommendedUsers: any[] = [];
  createdActivityId: number | null = null; // To store the created activity ID
  isFilterMenuVisible = false; // Track filter menu visibility
  visibleUsers: any[] = []; // Top 10 visible users
  excludedUsers: any[] = []; // Users excluded from the visible list
  isModalVisible = false;
  loggedInUserId: number | null = null; // User ID for fetching recommendations
  isRecommendedActivitiesVisible = false;
  showInvitationSuccess = false;
  activityFormData = {
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00', // Default time
    latitude: 0,
    longitude: 0,
  };

  searchInput: string = '';
  typeFilters: { [key: string]: { visible: boolean; markers: L.Marker[] } } =
    {};
  typeFiltersMarker: {
    [key: string]: { visible: boolean; markers: L.Marker[]; selected: boolean };
  } = {};

  constructor(
    private activityService: ActivityService,
    private apiService: ApiService,
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.map) {
      this.map.remove();
    }
    this.setLoggedInUserId();

    this.map = L.map('map').setView([40.7128, -74.006], 13); // Default to New York City

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markers.addTo(this.map);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;

      // Remove the previous marker if it exists
      if (this.selectedMarker) {
        this.map.removeLayer(this.selectedMarker);
      }

      // Pastel gradient for the selected location marker
      const selectedIcon = L.divIcon({
        className: 'modern-marker',
        html: `
          <div style="
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            background: linear-gradient(135deg, #a2d2ff, #bde0fe, #caffbf);
            box-shadow: 0px 4px 6px rgba(0,0,0,0.2);
            border: 2px solid #fff;
          ">
            📍
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      this.selectedMarker = L.marker([lat, lng], { icon: selectedIcon }).addTo(
        this.map
      );
      this.locationSelected.emit({ latitude: lat, longitude: lng });
    });

    // Assign the component instance to a global variable
    window.angularComponent = this;
  }

  toggleUserSelection(index: number): void {
    this.visibleUsers[index].selected = !this.visibleUsers[index].selected;
  }
  addActivityMarkers(items: any[]): void {
    this.markers.clearLayers(); // Clear existing markers

    items.forEach((item) => {
      const activity = item.activity;
      const { latitude, longitude, address } = activity.location;
      const { name, description, date } = activity;

      if (latitude && longitude) {
        // Pastel gradient icon for activities
        const activityIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #ffe5cc, #f8d9e3, #d8eafd);
              box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
              border: 2px solid #fff;
              font-size: 18px;
            ">
              ⭐
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([latitude, longitude], {
          icon: activityIcon,
        }).addTo(this.markers).bindPopup(`
          <div class="custom-popup-outer">
            <div style="
              padding: 10px; 
              max-width: 250px; 
              font-family: Arial, sans-serif; 
              border-radius: 8px; 
              box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); 
              background: linear-gradient(135deg, #d8eafd, #f8d9e3, #ffe5cc);
              color: #000; 
              text-align: left;
            ">
              <h4 style="margin: 0; font-size: 18px;">${name}</h4>
              <p style="margin: 8px 0; font-size: 14px;">
                ${description || 'No description available'}<br>
                <strong>Date:</strong> ${new Date(
                  date
                ).toLocaleDateString()}<br>
                <strong>Address:</strong> ${address || 'No address provided'}
              </p>
            </div>
          </div>
        `);

        marker.on('click', () => {
          console.log(`Clicked on activity: ${name}`);
        });
      }
    });

    this.map?.addLayer(this.markers); // Add updated markers to the map
  }

  setLoggedInUserId(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.loggedInUserId = payload.nameid;
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }

  getRecommendedActivities(): void {
    if (!this.loggedInUserId) {
      this.notificationService.showMessage('User not logged in!');
      return;
    }

    this.activityService
      .getRecommendedActivities(this.loggedInUserId)
      .subscribe({
        next: (activities) => {
          console.log('Recommended activities:', activities);
          this.recommendedActivities = activities;
          this.isRecommendedActivitiesVisible = true;
          this.addActivityMarkers(activities); // Add markers for recommended activities
        },
        error: (error) => {
          console.error('Error fetching recommended activities:', error);
          this.notificationService.showMessage(
            'Failed to fetch recommended activities. See console for details.'
          );
        },
      });
  }
  focusOnActivity(activity: any): void {
    const { name, description, date, location } = activity;

    if (location && location.latitude && location.longitude) {
      const { latitude, longitude, address } = location;

      // Format date and time
      const formattedDate = new Date(date).toLocaleDateString();
      const formattedTime = new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Find the existing marker
      const marker = this.markers.getLayers().find((layer: any) => {
        return (
          layer instanceof L.Marker &&
          layer.getLatLng().lat === latitude &&
          layer.getLatLng().lng === longitude
        );
      });

      if (marker) {
        // Update the popup content with consistent pastel style
        marker
          .bindPopup(
            `
            <div style="
              padding: 10px; 
              max-width: 250px; 
              font-family: Arial, sans-serif; 
              border-radius: 8px; 
              box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); 
              background: linear-gradient(135deg, #ffe5cc, #f8d9e3, #d8eafd);
              text-align: left;
            ">
              <h4 style="margin: 0; font-size: 18px; color: #ff7f7f;">${name}</h4>
              <p style="margin: 8px 0; font-size: 14px; color: #555;">
                ${description || 'No description available'}<br>
                <strong>Date:</strong> ${formattedDate} ${formattedTime}<br>
                <strong>Address:</strong> ${address || 'No address provided'}
              </p>
            </div>
          `
          )
          .openPopup();

        // Focus on the marker
        this.map?.setView([latitude, longitude], 14);
      } else {
        this.notificationService.showMessage(
          'Marker not found for the specified activity.'
        );
      }
    } else {
      this.notificationService.showMessage(
        'Location data not available for this activity.'
      );
    }
  }

  closeRecommendedActivities(): void {
    this.isRecommendedActivitiesVisible = false;
  }
  sendRequest(activityId: number): void {
    if (!activityId) {
      this.notificationService.showMessage('Invalid activity.');
      return;
    }

    const requestPayload = { ActivityId: activityId };

    this.activityService.requestApproval(requestPayload).subscribe({
      next: (response) => {
        console.log('Request response:', response);
      },
      error: (error) => {
        console.error('Error sending request:', error);
        this.notificationService.showMessage(
          'Failed to send request. Please try again.'
        );
      },
    });
  }

  excludeUser(index: number, event: MouseEvent): void {
    event.preventDefault(); // Prevent the default context menu

    // Remove the excluded user from the visible list
    const excludedUser = this.visibleUsers.splice(index, 1)[0];
    this.excludedUsers.push(excludedUser); // Add to excluded users list

    // Find the next user from the full list who is not currently visible or excluded
    const remainingUsers = this.recommendedUsers.filter(
      (user) =>
        !this.visibleUsers.includes(user) && !this.excludedUsers.includes(user)
    );

    if (remainingUsers.length > 0) {
      this.visibleUsers.push(remainingUsers[0]);
    } else {
      console.warn('No more users to add.');
    }

    console.log(`Excluded user: ${excludedUser.userName}`);
    console.log('Updated visible users:', this.visibleUsers);
    console.log('Excluded users:', this.excludedUsers);
  }

  toggleFilterMenu(): void {
    this.isFilterMenuVisible = !this.isFilterMenuVisible;
  }

  openModal(lat: number, lon: number): void {
    this.activityFormData.latitude = lat;
    this.activityFormData.longitude = lon;
    this.isModalVisible = true;
  }

  closeModal(event?: MouseEvent): void {
    this.isModalVisible = false;
    if (event) {
      event.stopPropagation(); // Optionally handle the event if passed
    }
  }

  isAnyUserSelected(): boolean {
    return this.visibleUsers.some((user) => user.selected);
  }

  sendSelectedInvitations(): void {
    const selectedUsers = this.recommendedUsers.filter((user) => user.selected);
    const receiverIds = selectedUsers.map((user) => user.userId);

    if (receiverIds.length === 0) {
      this.notificationService.showMessage('No users selected for invitation.');
      return;
    }

    if (this.createdActivityId === null) {
      this.notificationService.showMessage(
        'Activity ID is missing. Cannot send invitations.'
      );
      return;
    }

    this.activityService
      .sendInvitations(this.createdActivityId, receiverIds)
      .subscribe({
        next: () => {
          this.isRecommendedUsersModalVisible = false;
          // Trigger the success animation
          this.showInvitationSuccess = true;
          // Hide it after 3 seconds
          setTimeout(() => {
            this.showInvitationSuccess = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Error sending invitations:', error);
          this.notificationService.showMessage(
            'Failed to send invitations. See console for details.'
          );
        },
      });
  }

  submitActivity(): void {
    const { name, description, date, time, latitude, longitude } =
      this.activityFormData;

    if (!name || !description || !date || !time) {
      this.notificationService.showMessage('All fields are required!');
      return;
    }

    const combinedDateTime = new Date(`${date}T${time}`);

    const activityData = {
      name,
      description,
      date: combinedDateTime.toISOString(),
      latitude,
      longitude,
      createdById: this.getCreatedById(),
    };

    console.log('Creating activity:', activityData);

    this.activityService.createActivityWithCoordinates(activityData).subscribe({
      next: (createdActivity) => {
        this.isModalVisible = false;
        this.createdActivityId = createdActivity.id;

        console.log('Created activity:', createdActivity);
        // Now inform Flask service about the new activity
        this.apiService.addNewActivityInFlask(createdActivity.id).subscribe({
          next: () => {
          },
          error: (error) => {
            console.error('Error updating activity in Flask:', error);
            this.fetchRecommendedUsers(createdActivity.id, activityData.createdById);
          },
        });
        this.fetchRecommendedUsers(createdActivity.id, activityData.createdById);

      },
      error: (error) => {
        console.error('Error creating activity:', error);
        this.notificationService.showMessage(
          'Failed to create activity. See console for details.'
        );
      },
    });
  }

  fetchRecommendedUsers(activityId: number, createdById: number): void {
    this.activityService.getRecommendedUsersForActivity(activityId, createdById).subscribe({
      next: (users) => {
        console.log('Recommended users:', users);
        this.showRecommendedUsers(users);
      },
      error: (error) => {
        console.error('Error fetching recommended users:', error);
        this.notificationService.showMessage(
          'Failed to fetch recommended users.'
        );
      },
    });
  }

  showRecommendedUsers(users: any[]): void {
    if (!users || users.length === 0) {
      console.warn('No recommended users found.');
      this.recommendedUsers = [];
      this.visibleUsers = [];
      this.isRecommendedUsersModalVisible = false;
      return;
    }

    this.recommendedUsers = users.map((user) => ({
      ...user,
      selected: false,
    }));
    this.excludedUsers = []; // Clear excluded users when fetching new recommendations

    // Initialize the top 10 users as visible
    this.visibleUsers = this.recommendedUsers.slice(0, 10);
    this.isRecommendedUsersModalVisible = true;
  }

  closeRecommendedUsersModal(): void {
    this.isRecommendedUsersModalVisible = false;
  }

  get selectedUsers(): any[] {
    return this.recommendedUsers.filter((user) => user.selected);
  }

  sendInvitations(activityId: number): void {
    const selectedUsers = this.recommendedUsers.filter((user) => user.selected);
    const receiverIds = this.selectedUsers.map((user) => user.userId);

    if (receiverIds.length === 0) {
      this.notificationService.showMessage('No users selected for invitation.');
      return;
    }
    if (this.createdActivityId === null) {
      this.notificationService.showMessage(
        'Activity ID is missing. Cannot send invitations.'
      );
      return;
    }
    this.activityService.sendInvitations(activityId, receiverIds).subscribe({
      next: () => {
        this.closeRecommendedUsersModal();
      },
      error: (error) => {
        console.error('Error sending invitations:', error);
        this.notificationService.showMessage(
          'Failed to send invitations. Check console for details.'
        );
      },
    });
  }

  toggleFilterSelection(filterKey: string): void {
    const filter = this.typeFiltersMarker[filterKey];
    if (filter) {
      filter.visible = !filter.visible; // Toggle visibility
      console.log(`Filter ${filterKey} visibility: ${filter.visible}`);
      this.toggleMarkers(filterKey);
    }
  }

  getCreatedById(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.nameid || null;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  searchNearby(): void {
    if (!this.map) {
      console.error('Map is not initialized!');
      return;
    }

    if (!this.selectedMarker) {
      this.notificationService.showMessage('Firstly, choose your place on the map');
      return;
    }

    if (!this.searchInput) {
      this.notificationService.showMessage('Please enter a search term.');
      return;
    }

    this.activityService
      .getNearbyPlaces(
        this.map.getCenter().lat,
        this.map.getCenter().lng,
        this.searchInput
      )
      .subscribe({
        next: (places: any[]) => {
          console.log('Raw API response:', places);
          this.addMarkersToMap(places);
        },
        error: (error) => console.error('Error fetching nearby places:', error),
      });
  }

  addMarkersToMap(rawResponse: string[]): void {
    if (!this.map) {
      console.error('Map is not initialized!');
      return;
    }

    this.markers.clearLayers();
    this.typeFiltersMarker = {}; // Reset type filters

    rawResponse.forEach((rawEntry) => {
      const lines = rawEntry.split('\n');
      const typeMatch = rawEntry.match(/Nearby places for (.*?) = (.*?):/);

      const primaryType = typeMatch ? typeMatch[1].trim() : 'Unknown';
      const subType =
        typeMatch && typeMatch[2] ? typeMatch[2].trim() : 'General';

      const fullType = `${capitalize(primaryType)}, ${capitalize(subType)}`;

      lines.forEach((line) => {
        const nameMatch = line.match(/Name: (.*?),/);
        const latitudeMatch = line.match(/Latitude: ([^,]*)/);
        const longitudeMatch = line.match(/Longitude: ([^,]*)/);

        const name = nameMatch ? nameMatch[1].trim() : null;
        const lat =
          latitudeMatch && latitudeMatch[1]
            ? parseFloat(latitudeMatch[1])
            : NaN;
        const lon =
          longitudeMatch && longitudeMatch[1]
            ? parseFloat(longitudeMatch[1])
            : NaN;

        if (!name || isNaN(lat) || isNaN(lon)) {
          return;
        }

        // Unified pastel marker for nearby places
        const placeIcon = L.divIcon({
          className: 'modern-marker',
          html: `
            <div style="
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              background: linear-gradient(135deg, #a2d2ff, #bde0fe, #caffbf);
              box-shadow: 0px 4px 6px rgba(0,0,0,0.2);
              border: 2px solid #fff;
            ">
              📍
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([lat, lon], {
          icon: placeIcon,
        }).bindPopup(`
          <div style="
            padding: 12px; 
            max-width: 260px; 
            font-family: Arial, sans-serif; 
            border-radius: 10px; 
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15); 
            background: linear-gradient(135deg, #caffbf, #bde0fe, #a2d2ff);
            text-align: center;
            color: #333;
          ">
            <h3 style="margin: 0; color: #ff7f7f; font-size: 18px;">${name}</h3>
            <p style="margin: 10px 0; font-size: 14px;">
              <strong>Type:</strong> ${fullType}<br>
              <strong>Latitude:</strong> ${lat.toFixed(4)}<br>
              <strong>Longitude:</strong> ${lon.toFixed(4)}
            </p>
            <button 
              style="
                background-color: #ff7f7f; 
                color: #fff; 
                border: none; 
                padding: 8px 16px; 
                font-size: 14px; 
                border-radius: 8px; 
                cursor: pointer; 
                transition: background-color 0.3s ease;
              " 
              onmouseover="this.style.backgroundColor='#590053'" 
              onmouseout="this.style.backgroundColor='#ff7f7f'" 
              onclick="angularComponent.openModal(${lat}, ${lon})"
            >
              Make Activity
            </button>
          </div>
        `);

        this.markers.addLayer(marker);

        if (!this.typeFiltersMarker[fullType]) {
          this.typeFiltersMarker[fullType] = {
            visible: true,
            markers: [],
            selected: false,
          };
        }
        this.typeFiltersMarker[fullType].markers.push(marker);
      });
    });

    this.map.addLayer(this.markers);
  }

  toggleMarkers(type: string): void {
    const filter = this.typeFiltersMarker[type];
    if (!filter) return;

    if (filter.visible) {
      filter.markers.forEach((marker) => this.markers.addLayer(marker));
    } else {
      filter.markers.forEach((marker) => this.markers.removeLayer(marker));
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}

function getColoredIcon(type: string): L.Icon {
  if (!typeToColor[type]) {
    typeToColor[type] = getRandomColor();
  }
  const color = typeToColor[type];

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="${color}" d="M12.5 0C19.4 0 25 5.6 25 12.5 25 24.9 12.5 41 12.5 41S0 24.9 0 12.5C0 5.6 5.6 0 12.5 0z"/>
      <text x="12.5" y="22" font-size="12" fill="white" text-anchor="middle" alignment-baseline="middle" font-family="Arial">${type.charAt(
        0
      )}</text>
    </svg>
  `;

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });
}

function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const typeToColor: { [key: string]: string } = {};

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], // Default icon size
  iconAnchor: [12, 41], // Anchor point
  popupAnchor: [1, -34], // Popup anchor point
  shadowSize: [41, 41], // Shadow size
});
L.Marker.prototype.options.icon = defaultIcon;

// Make Angular method globally accessible for popup buttons
declare global {
  interface Window {
    angularComponent: ActivityMapComponent;
  }
}
