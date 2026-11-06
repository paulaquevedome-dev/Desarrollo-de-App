import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = [];

  constructor() { }

  public async addNewToGallery() {
    try {
      // Tomar foto
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100
      });

      // Agregar al arreglo solo si se capturó
      this.photos.unshift({
        filepath: 'photo_' + Date.now(),
        webviewPath: capturedPhoto.webPath!
      });
    } catch (error) {
      // Maneja la cancelación sin mostrar error rojo en la consola
      console.log('El usuario canceló o cerró la cámara');
    }
  }
}