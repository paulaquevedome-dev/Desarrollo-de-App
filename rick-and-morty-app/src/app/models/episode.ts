export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
}

export interface ApiResponse {
  results: Episode[];
}