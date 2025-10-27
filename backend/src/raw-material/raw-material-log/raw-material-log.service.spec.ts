import { Test, TestingModule } from '@nestjs/testing';
import { RawMaterialLogService } from './services/raw-material-log.service';

describe('RawMaterialLogService', () => {
  let service: RawMaterialLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RawMaterialLogService],
    }).compile();

    service = module.get<RawMaterialLogService>(RawMaterialLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
