// src/product/product-log/services/product-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { ProductBatch } from '../../product-batch/entities/product-batch.entity';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginationResult } from 'src/common/utils/pagination.util';
import { ProductLog } from '../entities/product-log.entity';
import { ProductLogQueryDto } from '../dto/product-log-query.dto';
import { ProductLogListResult, ProductLogResult } from '../helper';
import { ProductLogBaseService } from './product-log-base.service';
import { ProductLogFindAllService } from './product-log-find-all.service';
import { ProductLogFindOneService } from './product-log-find-one.service';
import { ProductLogRemoveService } from './product-log-remove.service';
import { ProductLogFindLogsService } from './product-log-find-logs.service';

@Injectable()
export class ProductLogService extends ProductLogBaseService {
  constructor(
    @InjectRepository(ProductLog)
    logRepo: Repository<ProductLog>,
    @InjectRepository(Product)
    productRepo: Repository<Product>,
    @InjectRepository(ProductBatch)
    batchRepo: Repository<ProductBatch>,
    private readonly finderAll: ProductLogFindAllService,
    private readonly finderOne: ProductLogFindOneService,
    private readonly remover: ProductLogRemoveService,
    private readonly listFinder: ProductLogFindLogsService,
  ) {
    super(logRepo, productRepo, batchRepo);
  }

  findAll(query: ProductLogQueryDto | PaginationQueryDto): Promise<PaginationResult<ProductLogResult>> {
    return this.finderAll.findAll(query as ProductLogQueryDto);
  }

  findOne(id: string): Promise<ProductLogResult> {
    return this.finderOne.findOne(id);
  }

  remove(id: string): Promise<ProductLog> {
    return this.remover.remove(id);
  }

  findLogs(query: ProductLogQueryDto): Promise<ProductLogListResult> {
    return this.listFinder.findLogs(query);
  }
}
