import { Test, TestingModule } from '@nestjs/testing';
import { RawMaterialBatchService } from './services/raw-material-batch.service';

describe('RawMaterialBatchService', () => {
  let service: RawMaterialBatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RawMaterialBatchService],
    }).compile();

    service = module.get<RawMaterialBatchService>(RawMaterialBatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
