import { Test, TestingModule } from '@nestjs/testing';
import { ProductBatchService } from './services/product-batch.service';

describe('ProductBatchService', () => {
  let service: ProductBatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductBatchService],
    }).compile();

    service = module.get<ProductBatchService>(ProductBatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
