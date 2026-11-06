import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ServerConfigService } from './server-config.service';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private serverConfig = inject(ServerConfigService);

  private readonly TOKEN_KEY = 'auth_token';
  
  public currentUser = signal<User | null>(null);
  public isAuthenticated = signal<boolean>(false);

  constructor() {
    this.loadStoredSession();
  }

  public async loadStoredSession() {
    const { value: token } = await Preferences.get({ key: this.TOKEN_KEY });
    if (token) {
      this.isAuthenticated.set(true);
      this.fetchMe().subscribe({
        error: () => this.logout()
      });
    }
  }

  public login(credentials: { login: string; password: string }): Observable<AuthResponse> {
    const url = `${this.serverConfig.apiUrl()}/auth/login`;
    return this.http.post<AuthResponse>(url, credentials).pipe(
      tap(async (response: AuthResponse) => {
        if (response.success && response.access_token) {
          await Preferences.set({ key: this.TOKEN_KEY, value: response.access_token });
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  public register(userData: any): Observable<AuthResponse> {
    const url = `${this.serverConfig.apiUrl()}/auth/register`;
    return this.http.post<AuthResponse>(url, userData).pipe(
      tap(async (response: AuthResponse) => {
        if (response.success && response.access_token) {
          await Preferences.set({ key: this.TOKEN_KEY, value: response.access_token });
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  public fetchMe(): Observable<{ success: boolean; user: User }> {
    const url = `${this.serverConfig.apiUrl()}/auth/me`;
    return this.http.get<{ success: boolean; user: User }>(url).pipe(
      tap((response: { success: boolean; user: User }) => {
        if (response.success) {
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  public async logout() {
    await Preferences.remove({ key: this.TOKEN_KEY });
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  public async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.TOKEN_KEY });
    return value;
  }
}