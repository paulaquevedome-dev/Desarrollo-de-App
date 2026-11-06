import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonFooter, 
  IonCard, 
  IonCardContent 
} from '@ionic/angular';
import * as L from 'leaflet';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButton, 
    IonFooter, 
    IonCard, 
    IonCardContent
  ]
})
export class MapPage implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  private authService = inject(AuthService);
  private map!: L.Map;
  private userMarker!: L.Marker;

  public userLocation: { lat: number; lng: number } | null = null;
  public isSearchingRide: boolean = false;

  ngOnInit() {}

  ionViewDidEnter() {
   this.initMap();
    // Forzamos a Leaflet a recalcular el tamaño para que no queden cuadros grises/blancos
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 300);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap() {
    if (this.map) {
      this.map.remove();
    }

    const defaultLat = 4.60971;
    const defaultLng = -74.08175;

    this.map = L.map(this.mapContainer.nativeElement).setView([defaultLat, defaultLng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.getCurrentLocation();
  }

  public getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.userLocation = { lat, lng };

          this.map.setView([lat, lng], 16);

          const customIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [35, 35],
            iconAnchor: [17, 35]
          });

          if (this.userMarker) {
            this.userMarker.setLatLng([lat, lng]);
          } else {
            this.userMarker = L.marker([lat, lng], { icon: customIcon })
              .addTo(this.map)
              .bindPopup('<b>¡Estás aquí!</b>')
              .openPopup();
          }
        },
        (error) => {
          console.warn('Error al obtener la ubicación GPS:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  }

  public requestRide() {
    this.isSearchingRide = true;
  }

  public logout() {
    this.authService.logout();
  }

  
}