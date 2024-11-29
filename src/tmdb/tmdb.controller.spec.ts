import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { TMDBController } from "./tmdb.controller";

describe("TmdbController", () => {
  let controller: TMDBController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TMDBController],
    }).compile();

    controller = module.get<TMDBController>(TMDBController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
