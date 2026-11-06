import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpisodeService } from '../../services/episode'; // Cambiado a ../../services/episode
import { Episode, ApiResponse } from '../../models/episode';

@Component({
  selector: 'app-episode-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './episode-list.html', // Cambiado de .component.html a ./episode-list.html
  styleUrl: './episode-list.css'
})
export class EpisodeListComponent implements OnInit {
  private episodeService = inject(EpisodeService);
  episodes: Episode[] = [];

  ngOnInit(): void {
    this.episodeService.getEpisodes().subscribe((res: ApiResponse) => {
      this.episodes = res.results;
    });
  }
}