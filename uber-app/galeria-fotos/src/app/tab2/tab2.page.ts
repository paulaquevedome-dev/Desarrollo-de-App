import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera } from 'ionicons/icons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, 
    IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonIcon, 
    CommonModule
  ]
})
export class Tab2Page {

  constructor(public photoService: PhotoService) {
    addIcons({ camera });
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
}