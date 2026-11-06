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
  IonText, 
  IonSelect, 
  IonSelectOption 
} from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
    IonText,
    IonSelect,
    IonSelectOption
  ]
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Objeto con los datos del formulario de registro basados en la API de Laravel
  public formData: any = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client', // por defecto cliente
    // Campos específicos para conductor
    license_number: '',
    plate: '',
    brand: '',
    model: '',
    year: '',
    capacity: 4,
    color: ''
  };

  public errorMessage: string = '';
  public isLoading: boolean = false;

  public onRegister() {
    if (!this.formData.name || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Por favor completa los campos obligatorios.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          const role = response.user.role;
          if (role === 'client') {
            this.router.navigate(['/client/map']);
          } else if (role === 'driver') {
            this.router.navigate(['/driver/dashboard']);
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al registrarse. Revisa los datos o la conexión.';
      }
    });
  }
}