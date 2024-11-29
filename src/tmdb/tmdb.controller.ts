/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get } from "@nestjs/common";
import { TMDBService } from "./tmdb.service";

@Controller("tmdb")
export class TMDBController {
  public constructor(private readonly tmdbService: TMDBService) {}

  /**
   * Endpoint para obtener las películas populares desde TMDB.
   * @returns Objeto con el nombre y lista de películas populares.
   */
  @Get("popular")
  public async getPopularMovies(): Promise<{
    name: string;
    movies: Array<{
      id: string;
      title: string;
      rating: number;
      release_date: string;
      vertical_image_large: string;
    }>;
  }> {
    return this.tmdbService.getPopularMovies();
  }
}
