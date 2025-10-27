import { Test, TestingModule } from '@nestjs/testing';
import { RawMaterialBatchController } from './raw-material-batch.controller';
import { RawMaterialBatchService } from './services/raw-material-batch.service';

describe('RawMaterialBatchController', () => {
  let controller: RawMaterialBatchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RawMaterialBatchController],
      providers: [RawMaterialBatchService],
    }).compile();

    controller = module.get<RawMaterialBatchController>(
      RawMaterialBatchController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
