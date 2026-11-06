import { Component } from '@angular/core';
import { EpisodeListComponent } from './components/episode-list/episode-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EpisodeListComponent],
  templateUrl: './app.html' // Usa la plantilla HTML principal
})
export class App {}