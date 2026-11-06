import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonText 
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonItem, 
    IonInput, 
    IonButton, 
    IonCard, 
    IonCardContent, 
    IonText
  ]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  public credentials = {
    login: '',
    password: ''
  };

  public errorMessage: string = '';
  public isLoading: boolean = false;

  public onLogin() {
    if (!this.credentials.login || !this.credentials.password) {
      this.errorMessage = 'Por favor completa todos los campos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const role = response.user.role;
          if (role === 'client') {
            this.router.navigate(['/client/map']);
          } else if (role === 'driver') {
            this.router.navigate(['/driver/dashboard']);
          } else if (role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Credenciales inválidas o error de conexión con el servidor.';
      }
    });
  }
}