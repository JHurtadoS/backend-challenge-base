import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "src/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { MoviesModule } from "src/movies/movies.module";
import { TMDBModule } from "src/tmdb/tmdb.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    MoviesModule,
    TMDBModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
