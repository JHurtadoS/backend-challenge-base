import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";

@Injectable()
export class TMDBService {
  private readonly apiKey = process.env.TMDB_API_KEY; // API Key configurada en tu .env

  public constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene películas populares desde la API de TMDB, mapeadas y encapsuladas en un objeto.
   * @returns Objeto con el nombre y las películas populares.
   */
  public async getPopularMovies(): Promise<{
    name: string;
    movies: Array<{
      id: string;
      title: string;
      rating: number; // Normalizado de 0 a 1
      release_date: string;
      vertical_image_large: string; // Cambiado de poster
    }>;
  }> {
    const response = await lastValueFrom(
      this.httpService.get("/movie/popular", {
        params: {
          api_key: this.apiKey,
          language: "en-US",
          page: 1,
        },
      }),
    );

    return {
      name: "TMDB Popular Movies",
      movies: response.data.results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.vote_average / 10, // Normalización
        release_date: movie.release_date,
        vertical_image_large: `https://image.tmdb.org/t/p/w500${movie.poster_path}`, // Renombrado y construcción de URL
      })),
    };
  }
}
