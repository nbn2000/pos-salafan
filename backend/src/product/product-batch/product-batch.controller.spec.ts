import { Test, TestingModule } from '@nestjs/testing';
import { ProductBatchController } from './product-batch.controller';
import { ProductBatchService } from './services/product-batch.service';

describe('ProductBatchController', () => {
  let controller: ProductBatchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductBatchController],
      providers: [ProductBatchService],
    }).compile();

    controller = module.get<ProductBatchController>(ProductBatchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
