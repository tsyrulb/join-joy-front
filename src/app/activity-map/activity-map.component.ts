import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-activity-map',
  standalone: true,
  imports: [],
  templateUrl: './activity-map.component.html',
  styleUrls: ['./activity-map.component.css']
})
export class ActivityMapComponent implements OnDestroy {
  @Output() locationSelected = new EventEmitter<{ latitude: number; longitude: number }>();

  private map: L.Map | undefined;

  ngOnInit(): void {
    // Ensure there's only one map instance
    if (this.map) {
      this.map.remove(); // Remove any existing map instance
    }

    // Initialize the map
    this.map = L.map('map').setView([51.505, -0.09], 13); // [Lat, Lng], Zoom level

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Add click event to get coordinates
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      console.log(`Selected coordinates: ${lat}, ${lng}`);
      this.locationSelected.emit({ latitude: lat, longitude: lng });
    });
  }

  ngOnDestroy(): void {
    // Cleanup the map instance when the component is destroyed
    if (this.map) {
      this.map.remove();
    }
  }
}

