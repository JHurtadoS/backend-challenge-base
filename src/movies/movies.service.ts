/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { BadRequestException, Injectable } from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";
import type { Database } from "database.types";

@Injectable()
export class MoviesService {
  private readonly supabaseClient: SupabaseClient<Database>;

  public constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseKey = this.configService.get<string>("SUPABASE_SERVICE_KEY");
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }
    this.supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
  }

  public async getMoviesGroupedByCategory(userLogged?: string): Promise<
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
    const favoriteMovieIds = userLogged
      ? ((
          await this.supabaseClient.from("favorites").select("movie_id").eq("user_id", userLogged)
        ).data?.map((fav) => fav.movie_id) ?? [])
      : [];

    const { data, error } = await this.supabaseClient
      .from("categories")
      .select(
        `name, movies(id, title, rating, horizontal_image,vertical_image_large,release_date)`,
      );

    if (error) {
      throw new Error(`Error fetching movies by category: ${error.message}`);
    }

    const cleanedData = (data || []).map((category) => ({
      name: category.name,
      movies: category.movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        rating: movie.rating ?? 0,
        horizontal_image: movie.horizontal_image || "",
        release_date: movie.release_date || "",
        vertical_image_large: movie.vertical_image_large || "",
        isFavorite: favoriteMovieIds.includes(movie.id),
      })),
    }));

    return cleanedData;
  }

  public async getMovieById(id: string): Promise<{
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
    const { data: movie, error: movieError } = await this.supabaseClient
      .from("movies")
      .select(
        `
      *,
      genres:movie_genres(
        genre:genres(
          id,
          name
        )
      )
    `,
      )
      .eq("id", id)
      .single();

    if (movieError) {
      throw new Error(`Error fetching movie by ID: ${movieError.message}`);
    }

    // Mapear los géneros
    // Mapear los géneros
    const genres = (movie.genres || [])
      .filter((g) => g.genre !== null) // Filtrar nulos
      .map((g) => ({
        id: g.genre?.id || "unknown", // Manejo por defecto si es null
        name: g.genre?.name || "Unnamed Genre",
      }));

    return {
      id: movie.id,
      title: movie.title,
      rating: movie.rating,
      horizontal_image: movie.horizontal_image,
      release_date: movie.release_date,
      trailer_url: movie.trailer_url,
      vertical_image_small: movie.vertical_image_small,
      vertical_image_large: movie.vertical_image_large,
      category_id: movie.category_id,
      genres,
    };
  }

  public async updateFavorites(
    userId: string,
    movieId: string,
  ): Promise<{ user_id: string; movie_id: string }> {
    const { data, error } = await this.supabaseClient
      .from("favorites")
      .upsert({ user_id: userId, movie_id: movieId })
      .select();

    if (error) {
      throw new Error(`Error updating favorites: ${error.message}`);
    }

    if (data.length === 0) {
      throw new Error("No data returned from Supabase after updating favorites.");
    }

    return data[0];
  }

  public async getFavoritesGroupedByCategory(userId: string): Promise<
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
    const { data: favorites, error: favoritesError } = await this.supabaseClient
      .from("favorites")
      .select(
        `
      movie_id,
      movies(
        id,
        title,
        rating,
        horizontal_image,
        vertical_image_large,
        release_date,
        category_id
      )
    `,
      )
      .eq("user_id", userId);

    if (favoritesError) {
      throw new Error(`Error fetching favorites: ${favoritesError.message}`);
    }

    if (!favorites || favorites.length === 0) {
      return [];
    }

    const categoryIds = favorites
      .map((fav) => fav.movies?.category_id)
      .filter((id): id is string => !!id);

    const { data: categories, error: categoriesError } = await this.supabaseClient
      .from("categories")
      .select("*")
      .in("id", categoryIds);

    if (categoriesError) {
      throw new Error(`Error fetching categories: ${categoriesError.message}`);
    }

    if (!categories || categories.length === 0) {
      return [];
    }

    const groupedData = categories.map((category) => {
      const movies = favorites
        .filter((fav) => fav.movies?.category_id === category.id)
        .map((fav) => ({
          id: fav.movies?.id || "Unknown ID",
          title: fav.movies?.title || "Untitled",
          rating: fav.movies?.rating ?? 0,
          release_date: fav.movies?.title || "No date",
          horizontal_image: fav.movies?.horizontal_image || "No image available",
          vertical_image_large: fav.movies?.horizontal_image || "No image available",
        }));

      return {
        name: category.name || "Unnamed Category",
        movies,
      };
    });

    return groupedData;
  }

  public async createMovie(data: {
    title: string;
    rating: number;
    release_date: string;
    category_id: string;
    horizontal_image?: Express.Multer.File;
    vertical_image_small?: Express.Multer.File;
    vertical_image_large?: Express.Multer.File;
    trailer_url: string;
  }): Promise<string> {
    const bucketName = "movies-images";
    const imageUrls: Record<string, string | null> = {
      horizontal_image: null,
      vertical_image_small: null,
      vertical_image_large: null,
    };

    const imageUploadPromises = Object.entries(data)
      .filter(([key, file]) => key.includes("image") && !!file)
      .map(async ([key, file]) => {
        const typedFile = file as Express.Multer.File;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!typedFile || !typedFile.buffer || !typedFile.originalname) {
          throw new BadRequestException(`Invalid file for ${key}`);
        }

        const filePath = `${key}/${typedFile.originalname}`;

        const { error: uploadError } = await this.supabaseClient.storage
          .from(bucketName)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          .upload(filePath, typedFile.buffer, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw new BadRequestException(`Failed to upload ${key}: ${uploadError.message}`);
        }

        const { data: publicUrl } = this.supabaseClient.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!publicUrl || !publicUrl.publicUrl) {
          throw new BadRequestException(`Failed to get public URL for ${key}`);
        }

        imageUrls[key] = publicUrl.publicUrl;
      });

    await Promise.all(imageUploadPromises);

    const { error: insertError } = await this.supabaseClient.from("movies").insert({
      title: data.title,
      rating: data.rating,
      release_date: data.release_date,
      category_id: data.category_id,
      horizontal_image: imageUrls.horizontal_image,
      trailer_url: data.trailer_url,
      vertical_image_small: imageUrls.vertical_image_small,
      vertical_image_large: imageUrls.vertical_image_large,
    });

    if (insertError) {
      throw new BadRequestException(`Error creating movie record: ${insertError.message}`);
    }

    return "Movie created successfully!";
  }

  public async getRecommendations(movieId: string): Promise<
    Array<{
      id: string;
      title: string;
      rating: number;
      horizontal_image: string;
      vertical_image_large: string;
    }>
  > {
    const { data: movieGenres, error: genresError } = await this.supabaseClient
      .from("movie_genres")
      .select("genre_id")
      .eq("movie_id", movieId);

    if (genresError || !movieGenres) {
      throw new Error(`Error fetching genres for movie ID ${movieId}: ${genresError.message}`);
    }

    const genreIds = movieGenres.map((genre) => genre.genre_id);

    const { data: moviesWithGenres, error: moviesError } = await this.supabaseClient
      .from("movie_genres")
      .select("movie_id, genre_id")
      .neq("movie_id", movieId)
      .in("genre_id", genreIds);

    if (moviesError || !moviesWithGenres) {
      throw new Error(`Error fetching movies by genres: ${moviesError.message}`);
    }

    const genreMatchCounts: Record<string, number> = {};

    moviesWithGenres.forEach((relation) => {
      if (!genreMatchCounts[relation.movie_id]) {
        genreMatchCounts[relation.movie_id] = 0;
      }
      genreMatchCounts[relation.movie_id]++;
    });

    // Ordenar las películas por coincidencias de géneros y limitar a 5
    const sortedMovieIds = Object.entries(genreMatchCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([movieId]) => movieId);

    const { data: recommendedMovies, error: recError } = await this.supabaseClient
      .from("movies")
      .select("id, title, rating, horizontal_image,vertical_image_large")
      .in("id", sortedMovieIds)
      .order("rating", { ascending: false });

    if (recError || !recommendedMovies) {
      throw new Error(`Error fetching recommended movies: ${recError.message}`);
    }

    const cleanedMovies = recommendedMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      rating: movie.rating ?? 0,
      horizontal_image: movie.horizontal_image ?? "",
      vertical_image_large: movie.vertical_image_large ?? "",
    }));

    return cleanedMovies;
  }

  public async getMoviesByGenre(
    genreId: string,
    userLogged?: string,
  ): Promise<
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
    const favoriteMovieIds = userLogged
      ? ((
          await this.supabaseClient.from("favorites").select("movie_id").eq("user_id", userLogged)
        ).data?.map((fav) => fav.movie_id) ?? [])
      : [];

    const { data, error } = await this.supabaseClient.from("categories").select(
      `
      name,
      movies(
        id,
        title,
        rating,
        horizontal_image,
        release_date,
        vertical_image_large,
        movie_genres(genre_id)
      )
    `,
    );

    if (error) {
      throw new Error(`Error fetching movies by genre: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    const cleanedData = data.map((category) => ({
      name: category.name,
      movies: category.movies
        .filter((movie) => movie.movie_genres.some((genre) => genre.genre_id === genreId))
        .map((movie) => ({
          id: movie.id,
          title: movie.title,
          rating: movie.rating ?? 0,
          horizontal_image: movie.horizontal_image || "",
          release_date: movie.release_date || "",
          vertical_image_large: movie.vertical_image_large || "",
          isFavorite: favoriteMovieIds.includes(movie.id),
        })),
    }));

    return cleanedData;
  }

  public async getAllGenres(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await this.supabaseClient
      .from("genres")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      throw new BadRequestException(`Error fetching genres: ${error.message}`);
    }

    return data ?? [];
  }
}
