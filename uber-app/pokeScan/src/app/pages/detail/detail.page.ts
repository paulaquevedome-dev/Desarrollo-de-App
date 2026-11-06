import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location, TitleCasePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

type PokemonStat = {
  base_stat: number;
  stat: { name: string };
};

type PokemonDetails = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites?: {
    front_default?: string | null;
    other?: {
      'official-artwork'?: { front_default?: string | null };
    };
  };
  types: Array<{ slot: number; type: { name: string } }>;
  stats: PokemonStat[];
};

type PokemonSpecies = {
  flavor_text_entries?: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
};

const TYPE_LABELS: Record<string, string> = {
  bug: 'Bicho',
  dark: 'Siniestro',
  dragon: 'Dragón',
  electric: 'Eléctrico',
  fairy: 'Hada',
  fighting: 'Lucha',
  fire: 'Fuego',
  flying: 'Volador',
  ghost: 'Fantasma',
  grass: 'Planta',
  ground: 'Tierra',
  ice: 'Hielo',
  normal: 'Normal',
  poison: 'Veneno',
  psychic: 'Psíquico',
  rock: 'Roca',
  steel: 'Acero',
  water: 'Agua'
};

const STAT_LABELS: Record<string, string> = {
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidad'
};

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    TitleCasePipe, 
    DecimalPipe,
    RouterModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonSpinner,
    IonTitle,
    IonToolbar
  ],
})
export class DetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private http = inject(HttpClient);
  private changeDetector = inject(ChangeDetectorRef);

  pokemon: PokemonDetails | null = null;
  captureImageUrl: string | null = null;
  description: string = 'Cargando descripción en español...';
  isLoading = true;
  loadError: string | null = null;
  private pokemonId = '';

  get health(): number {
    return this.pokemon?.stats.find(stat => stat.stat.name === 'hp')?.base_stat ?? 0;
  }

  get combatStats(): PokemonStat[] {
    return this.pokemon?.stats.filter(stat => stat.stat.name !== 'hp') ?? [];
  }

  ngOnInit() {
    const navigationState: unknown = this.location.getState();
    if (
      typeof navigationState === 'object' &&
      navigationState !== null &&
      'captureImageUrl' in navigationState &&
      typeof navigationState.captureImageUrl === 'string'
    ) {
      this.captureImageUrl = navigationState.captureImageUrl;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadDirectData(id);
      } else {
        this.isLoading = false;
        this.loadError = 'No se recibió el identificador del Pokémon. Vuelve a la lista e inténtalo otra vez.';
        this.changeDetector.markForCheck();
      }
    });
  }

  loadDirectData(id: string) {
    this.pokemonId = id;
    this.isLoading = true;
    this.loadError = null;
    this.pokemon = null;
    this.description = 'Cargando descripción en español...';
    this.changeDetector.markForCheck();

    this.http.get<PokemonDetails>(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(id)}`).pipe(
      timeout({ first: 15000 })
    ).subscribe({
      next: (pokemonData: PokemonDetails) => {
        this.pokemon = pokemonData;
        this.isLoading = false;
        this.changeDetector.markForCheck();

        this.http.get<PokemonSpecies>(`https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(id)}`).pipe(
          timeout({ first: 15000 })
        ).subscribe({
          next: (speciesData: PokemonSpecies) => {
            const entry = speciesData.flavor_text_entries?.find(e => e.language.name === 'es');
            const desc = entry ? entry.flavor_text.replace(/[\n\f]/g, ' ') : 'Sin descripción disponible en español.';
            
            this.description = desc;
            this.changeDetector.markForCheck();
          },
          error: () => {
            this.description = 'Sin descripción disponible.';
            this.changeDetector.markForCheck();
          }
        });
      },
      error: (err: unknown) => {
        console.error('Error crítico al conectar con la PokeAPI:', err);
        this.isLoading = false;
        this.loadError = err instanceof Error && err.name === 'TimeoutError'
          ? 'La solicitud tardó demasiado. Revisa tu conexión e inténtalo de nuevo.'
          : 'No se pudo cargar la información del Pokémon. Revisa tu conexión e inténtalo de nuevo.';
        this.changeDetector.markForCheck();
      }
    });
  }

  retryLoading() {
    if (this.pokemonId) {
      this.loadDirectData(this.pokemonId);
    }
  }

  typeLabel(name: string): string {
    return TYPE_LABELS[name] ?? name;
  }

  statLabel(name: string): string {
    return STAT_LABELS[name] ?? name;
  }

  statWidth(value: number): number {
    return Math.min((value / 255) * 100, 100);
  }

  useArtworkFallback() {
    this.captureImageUrl = null;
  }
}