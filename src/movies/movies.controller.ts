import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";

class UpdateFavoritesDto {
  public userId!: string;
  public movieId!: string;
}

@Controller("movies")
export class MoviesController {
  public constructor(private readonly moviesService: MoviesService) {}

  @Get()
  public async getMoviesGroupedByCategory(@Query("userLogged") userLogged?: string): Promise<
    Array<{
      name: string;
      movies: Array<{
        id: string;
        title: string;
        rating: number;
        horizontal_image: string;
        release_date: string;
        vertical_image_large: string;
        isFavorite: boolean;
      }>;
    }>
  > {
    return this.moviesService.getMoviesGroupedByCategory(userLogged);
  }

  @Post("favorites")
  public async updateFavorites(
    @Body() updateFavoritesDto: UpdateFavoritesDto,
  ): Promise<{ message: string }> {
    await this.moviesService.updateFavorites(updateFavoritesDto.userId, updateFavoritesDto.movieId);
    return { message: "Favorite updated successfully" };
  }

  @Get("favorites")
  public async getFavoritesGroupedByCategory(@Query("userId") userId: string): Promise<
    Array<{
      name: string;
      movies: Array<{
        id: string;
        title: string;
        rating: number;
        release_date: string;
        horizontal_image: string;
        vertical_image_large: string;
      }>;
    }>
  > {
    return this.moviesService.getFavoritesGroupedByCategory(userId);
  }

  @Post("create")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "horizontal_image", maxCount: 1 },
      { name: "vertical_image_small", maxCount: 1 },
      { name: "vertical_image_large", maxCount: 1 },
    ]),
  )
  public async createMovie(
    @UploadedFiles()
    files: {
      horizontal_image?: Express.Multer.File[];
      vertical_image_small?: Express.Multer.File[];
      vertical_image_large?: Express.Multer.File[];
    },
    @Body()
    body: {
      title: string;
      rating: string;
      release_date: string;
      category_id: string;
      trailer_url: string;
    },
  ): Promise<string> {
    const images = {
      horizontal_image: files.horizontal_image?.[0] || undefined,
      vertical_image_small: files.vertical_image_small?.[0] || undefined,
      vertical_image_large: files.vertical_image_large?.[0] || undefined,
    };

    return this.moviesService.createMovie({
      title: body.title,
      rating: parseFloat(body.rating),
      release_date: body.release_date,
      category_id: body.category_id,
      trailer_url: body.trailer_url,
      ...images,
    });
  }

  @Get("recommendations")
  public async getRecommendations(@Query("movieId") movieId: string): Promise<
    Array<{
      id: string;
      title: string;
      rating: number;
      horizontal_image: string;
      vertical_image_large: string;
    }>
  > {
    if (!movieId) {
      throw new BadRequestException("movieId is required.");
    }
    return this.moviesService.getRecommendations(movieId);
  }

  @Get("by-genre")
  public async getMoviesByGenre(
    @Query("genreId") genreId: string,
    @Query("userLogged") userLogged?: string,
  ): Promise<
    Array<{
      name: string;
      movies: Array<{
        id: string;
        title: string;
        rating: number;
        release_date: string;
        horizontal_image: string;
        vertical_image_large: string;
        isFavorite: boolean;
      }>;
    }>
  > {
    return this.moviesService.getMoviesByGenre(genreId, userLogged);
  }

  @Get("genres")
  public async getAllGenres(): Promise<Array<{ id: string; name: string }>> {
    return this.moviesService.getAllGenres();
  }

  @Get(":id")
  public async getMovieById(@Param("id") id: string): Promise<{
    id: string;
    title: string;
    rating: number | null;
    horizontal_image: string | null;
    release_date: string | null;
    trailer_url?: string | null;
    vertical_image_small?: string | null;
    vertical_image_large?: string | null;
    category_id?: string | null;
    genres: Array<{ id: string; name: string }>;
  }> {
    return this.moviesService.getMovieById(id);
  }
}
