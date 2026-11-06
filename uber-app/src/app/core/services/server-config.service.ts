import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServerConfigService {
  private readonly STORAGE_KEY = 'custom_api_url';
  
  // Signal para tener la URL reactiva en toda la app
  public apiUrl = signal<string>(environment.apiUrl);

  constructor() {
    this.loadSavedUrl();
  }

  // Carga la URL guardada previamente en el dispositivo
  private async loadSavedUrl() {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    if (value) {
      this.apiUrl.set(value);
    }
  }

  // Permite actualizar la URL (para la pantalla "Configurar servidor" más adelante)
  public async setApiUrl(newUrl: string) {
    // Limpiamos la barra al final si la trae
    const cleanUrl = newUrl.endsWith('/') ? newUrl.slice(0, -1) : newUrl;
    await Preferences.set({ key: this.STORAGE_KEY, value: cleanUrl });
    this.apiUrl.set(cleanUrl);
  }
}