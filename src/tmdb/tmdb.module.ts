import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TMDBService } from "./tmdb.service";
import { TMDBController } from "./tmdb.controller";

@Module({
  imports: [
    HttpModule.register({
      baseURL: "https://api.themoviedb.org/3",
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [TMDBService],
  controllers: [TMDBController], // Aquí registramos el controlador
  exports: [TMDBService],
})
export class TMDBModule {}
