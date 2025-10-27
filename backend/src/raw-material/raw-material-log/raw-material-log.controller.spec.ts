import { Test, TestingModule } from '@nestjs/testing';
import { RawMaterialLogController } from './raw-material-log.controller';
import { RawMaterialLogService } from './services/raw-material-log.service';

describe('RawMaterialLogController', () => {
  let controller: RawMaterialLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RawMaterialLogController],
      providers: [RawMaterialLogService],
    }).compile();

    controller = module.get<RawMaterialLogController>(RawMaterialLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
