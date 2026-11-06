import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/episode';

@Injectable({
  providedIn: 'root'
})
export class EpisodeService {
  private http = inject(HttpClient);
  private apiUrl = 'https://rickandmortyapi.com/api/episode';

  getEpisodes(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }
}