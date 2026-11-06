import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonInput, IonButton, IonCard, IonCardContent } from '@ionic/angular';
import { ServerConfigService } from '../../core/services/server-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-config',
  templateUrl: './server-config.page.html',
  styleUrls: ['./server-config.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonItem, 
    IonInput, 
    IonButton, 
    IonCard, 
    IonCardContent
  ]
})
export class ServerConfigPage {
  private serverConfig = inject(ServerConfigService);
  private router = inject(Router);

  public currentIpUrl: string = this.serverConfig.apiUrl();

  public async saveServerUrl() {
    if (!this.currentIpUrl.trim()) return;
    
    await this.serverConfig.setApiUrl(this.currentIpUrl);
    alert('¡IP del servidor guardada con éxito!');
    this.router.navigate(['/login']);
  }
}