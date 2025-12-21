import { Test, TestingModule } from '@nestjs/testing';
import { VectorizeController } from './vectorize.controller';

describe('VectorizeController', () => {
  let controller: VectorizeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VectorizeController],
    }).compile();

    controller = module.get<VectorizeController>(VectorizeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
