import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  // Obtener los primeros 151 Pokémon (Primera Generación)
  getFirstGenPokemon(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon?limit=151&offset=0`);
  }

  // Obtener detalles completos de un Pokémon por nombre o ID
  getPokemonDetails(nameOrId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon/${nameOrId}`);
  }

  // Obtener descripción (specie / flavor text) en español
  getPokemonSpecies(nameOrId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon-species/${nameOrId}`);
  }
}