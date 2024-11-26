import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../activity.service';
import { MatTableModule } from '@angular/material/table'  
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-activity-map',
  standalone: true,
  imports: [FormsModule, CommonModule, MatTableModule, MatIconModule],
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
  recommendedUsers: any[] = [];
  createdActivityId: number | null = null; // To store the created activity ID

  isModalVisible = false;
  activityFormData = {
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    latitude: 0,
    longitude: 0,
  };

  searchInput: string = '';
  typeFilters: { [key: string]: { visible: boolean; markers: L.Marker[] } } =
    {};

  constructor(
    private activityService: ActivityService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([40.7128, -74.006], 13); // Default to New York City

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markers.addTo(this.map);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;

      if (this.selectedMarker) {
        this.selectedMarker.setLatLng(event.latlng);
      } else {
        this.selectedMarker = L.marker(event.latlng).addTo(this.map);
      }

      console.log(`Selected coordinates: ${lat}, ${lng}`);
      this.locationSelected.emit({ latitude: lat, longitude: lng });
    });

    // Assign the component instance to a global variable
    window.angularComponent = this;
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
    return this.recommendedUsers.some(user => user.selected);
  }
  
  sendSelectedInvitations(): void {
    const selectedUsers = this.recommendedUsers.filter((user) => user.selected);
    const receiverIds = selectedUsers.map((user) => user.userId);
  
    if (receiverIds.length === 0) {
      alert('No users selected for invitation.');
      return;
    }
  
    if (this.createdActivityId === null) {
      alert('Activity ID is missing. Cannot send invitations.');
      return;
    }
  
    this.activityService.sendInvitations(this.createdActivityId, receiverIds).subscribe({
      next: () => {
        alert('Invitations sent successfully!');
        this.isRecommendedUsersModalVisible = false;
      },
      error: (error) => {
        console.error('Error sending invitations:', error);
        alert('Failed to send invitations. See console for details.');
      },
    });
  }
  
  
  submitActivity(): void {
    const { name, description, date, latitude, longitude } = this.activityFormData;
  
    if (!name || !description || !date) {
      alert('All fields are required!');
      return;
    }
  
    const activityData = {
      name,
      description,
      date,
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
  
        // Fetch recommended users for the created activity
        this.activityService.fetchRecommendedUsers(createdActivity.id).subscribe({
          next: (recommendedUsers) => {
            console.log('Recommended users:', recommendedUsers);
  
            // Show modal for user selection
            this.recommendedUsers = recommendedUsers; // Set this in your component
            this.isRecommendedUsersModalVisible = true; // Open the modal
          },
          error: (error) => {
            console.error('Error fetching recommended users:', error);
            alert('Failed to fetch recommended users. See console for details.');
          },
        });
      },
      error: (error) => {
        console.error('Error creating activity:', error);
        alert('Failed to create activity. See console for details.');
      },
    });
  }
  
  
  
  // Fetch recommended users for an activity
  fetchRecommendedUsers(activityId: number): void {
    this.activityService.getRecommendedUsersForActivity(activityId).subscribe({
      next: (users) => {
        console.log('Recommended users:', users);
        this.showRecommendedUsers(users);
      },
      error: (error) => {
        console.error('Error fetching recommended users:', error);
        alert('Failed to fetch recommended users.');
      },
    });
  }

  showRecommendedUsers(users: any[]): void {
    this.recommendedUsers = users;
    this.isRecommendedUsersModalVisible = true;
  }

  get selectedUsers(): any[] {
    return this.recommendedUsers.filter((user) => user.selected);
  }

  sendInvitations(activityId: number): void {
    const receiverIds = this.selectedUsers.map((user) => user.userId);
  
    if (!receiverIds.length) {
      alert('No users selected for invitations.');
      return;
    }
  
    this.activityService.sendInvitations(activityId, receiverIds).subscribe({
      next: () => {
        alert('Invitations sent successfully!');
      },
      error: (error) => {
        console.error('Error sending invitations:', error);
        alert('Failed to send invitations. Check console for details.');
      },
    });
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

    if (!this.searchInput) {
      alert('Please enter a search term.');
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
    this.typeFilters = {};

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

        console.log(
          `Adding marker for: ${name} (${fullType}) at (${lat}, ${lon})`
        );

        const marker = L.marker([lat, lon], {
          icon: getColoredIcon(fullType),
        }).bindPopup(
          `<b>${name}</b><br>Type: ${fullType}<br>Latitude: ${lat}, Longitude: ${lon}<br>
           <button onclick="angularComponent.openModal(${lat}, ${lon})">I want this place!</button>`
        );

        this.markers.addLayer(marker);

        if (!this.typeFilters[fullType]) {
          this.typeFilters[fullType] = { visible: true, markers: [] };
        }
        this.typeFilters[fullType].markers.push(marker);
      });
    });

    this.map.addLayer(this.markers);
  }

  toggleMarkers(type: string): void {
    const filter = this.typeFilters[type];
    if (!filter) return;

    filter.visible = !filter.visible;
    filter.markers.forEach((marker) => {
      if (filter.visible) {
        this.markers.addLayer(marker);
      } else {
        this.markers.removeLayer(marker);
      }
    });
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
