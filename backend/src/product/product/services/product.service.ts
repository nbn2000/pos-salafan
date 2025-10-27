import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductBatch } from '../../product-batch/entities/product-batch.entity';
import { ProductLog } from '../../product-log/entities/product-log.entity';
import { Product } from '../entities/product.entity';

import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductPagedWithTotals, ProductView, ProductRefillItem } from '../helper';
import { ProductQueryDto } from '../dto/product-query.dto';

import { ProductBaseService } from './product-base.service';
import { ProductCreateService } from './product-create.service';
import { ProductFindAllService } from './product-find-all.service';
import { ProductFindOneService } from './product-find-one.service';
import { ProductRemoveService } from './product-remove.service';
import { ProductUpdateService } from './product-update.service';

@Injectable()
export class ProductService extends ProductBaseService {
  constructor(
    @InjectRepository(Product) productRepo: Repository<Product>,
    @InjectRepository(ProductBatch) batchRepo: Repository<ProductBatch>,
    @InjectRepository(ProductLog) logRepo: Repository<ProductLog>,
    // sub-services
    private readonly creator: ProductCreateService,
    private readonly finderAll: ProductFindAllService,
    private readonly finderOneSvc: ProductFindOneService,
    private readonly updater: ProductUpdateService,
    private readonly remover: ProductRemoveService,
  ) {
    super(
      productRepo,
      batchRepo,
      logRepo,
    );

    this.creator.findOne = (id: string): Promise<ProductView> =>
      this.findOne(id);
    this.updater.findOne = (id: string): Promise<ProductView> =>
      this.findOne(id);
  }

  create(dto: CreateProductDto): Promise<ProductView> {
    return this.creator.create(dto);
  }

  findAll(query: ProductQueryDto): Promise<ProductPagedWithTotals> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<ProductView> {
    return this.finderOneSvc.findOne(id);
  }

  update(id: string, dto: UpdateProductDto): Promise<ProductView> {
    return this.updater.update(id, dto);
  }

  remove(id: string): Promise<{ success: true }> {
    return this.remover.remove(id);
  }

  findToFillStore(): Promise<ProductRefillItem[]> {
    return Promise.resolve([] as ProductRefillItem[]);
  }
}




