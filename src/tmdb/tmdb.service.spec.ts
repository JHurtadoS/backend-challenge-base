import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { TMDBService } from "./tmdb.service";

describe("TmdbService", () => {
  let service: TMDBService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TMDBService],
    }).compile();

    service = module.get<TMDBService>(TMDBService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
