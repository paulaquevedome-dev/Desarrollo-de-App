import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonButton, IonContent, IonIcon, IonSearchbar, IonSpinner } from '@ionic/angular';
import { PokemonService } from '../services/pokemon';
import { PokemonRecognitionService } from '../services/pokemon-recognition';

type RecognitionCandidate = {
  id: number;
  name: string;
};

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TitleCasePipe, 
    DecimalPipe,
    IonButton,
    IonContent,
    IonIcon,
    IonSearchbar,
    IonSpinner
  ],
})
export class HomePage implements OnInit {
  private pokemonService = inject(PokemonService);
  private router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);
  private pokemonRecognition = inject(PokemonRecognitionService);

  allPokemon: any[] = [];
  filteredPokemon: any[] = [];
  myScans: any[] = [];
  filteredScans: any[] = [];
  searchTerm: string = '';
  activeTab: 'all' | 'scans' = 'all';
  loadError: string | null = null;
  isRecognizing = false;
  recognitionStatus = '';
  recognitionError: string | null = null;

  ngOnInit() {
    this.loadFirstGen();
  }

  loadFirstGen() {
    this.loadError = null;
    this.pokemonService.getFirstGenPokemon().subscribe({
      next: (res: any) => {
        this.allPokemon = res.results.map((p: any, index: number) => ({
          id: index + 1,
          name: p.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`
        }));
        this.filteredPokemon = this.allPokemon;
        this.filteredScans = this.myScans;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        console.error('No se pudo cargar la lista de Pokémon:', error);
        this.loadError = 'No se pudo cargar la Pokédex. Revisa tu conexión e inténtalo de nuevo.';
        this.changeDetector.markForCheck();
      }
    });
  }

  filterPokemon() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredPokemon = this.allPokemon;
      this.filteredScans = this.myScans;
      return;
    }
    
    this.filteredPokemon = this.allPokemon.filter(p => 
      p.name.toLowerCase().includes(term) || p.id.toString() === term
    );

    this.filteredScans = this.myScans.filter(p => 
      p.name.toLowerCase().includes(term) || p.id.toString() === term
    );
  }

  async scanPokemonCamera() {
    try {
      const photo = await Camera.takePhoto({
        quality: 90
      });
      if (!photo.webPath) {
        throw new Error('La cámara no devolvió una imagen que se pueda analizar.');
      }
      await this.recognizePhoto(photo.webPath);
    } catch (error: unknown) {
      this.showRecognitionError(error);
    }
  }

  async pickFromGallery() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      if (!photo.webPath) {
        throw new Error('La imagen seleccionada no se pudo abrir.');
      }
      await this.recognizePhoto(photo.webPath);
    } catch (error: unknown) {
      this.showRecognitionError(error);
    }
  }

  async recognizePhoto(imageUrl: string) {
    this.isRecognizing = true;
    this.recognitionError = null;
    this.recognitionStatus = 'Analizando la imagen localmente...';
    this.changeDetector.markForCheck();

    try {
      const pokemon = await this.pokemonRecognition.recognize(
        imageUrl,
        status => {
          this.recognitionStatus = status;
          this.changeDetector.markForCheck();
        }
      );
      this.registerCapture(pokemon, imageUrl);
    } catch (error: unknown) {
      this.showRecognitionError(error);
    } finally {
      this.isRecognizing = false;
      this.changeDetector.markForCheck();
    }
  }

  private showRecognitionError(error: unknown) {
    console.error('No se pudo reconocer la imagen:', error);
    this.recognitionError = error instanceof Error
      ? error.message
      : 'No se pudo reconocer la imagen. Inténtalo de nuevo.';
    this.isRecognizing = false;
    this.changeDetector.markForCheck();
  }

  registerCapture(pokemon: RecognitionCandidate, imageUrl: string) {
    if (!this.myScans.some(capture => capture.id === pokemon.id)) {
      this.myScans.unshift({
        id: pokemon.id,
        name: pokemon.name.toLowerCase(),
        image: imageUrl
      });
      this.filteredScans = this.myScans;
    }
    this.changeDetector.markForCheck();
    void this.router.navigate(['/detail', pokemon.id], {
      state: { captureImageUrl: imageUrl }
    });
  }

  viewDetails(id: number | string) {
    if (id) {
      this.router.navigate(['/detail', id]);
    }
  }
}