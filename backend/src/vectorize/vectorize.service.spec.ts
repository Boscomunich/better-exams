import { Test, TestingModule } from '@nestjs/testing';
import { VectorizeService } from './vectorize.service';

describe('VectorizeService', () => {
  let service: VectorizeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VectorizeService],
    }).compile();

    service = module.get<VectorizeService>(VectorizeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
