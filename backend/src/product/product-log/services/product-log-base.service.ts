// src/product/product-log/services/product-log-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductLog } from '../entities/product-log.entity';

@Injectable()
export class ProductLogBaseService {
  constructor(
    @InjectRepository(ProductLog)
    protected readonly logRepo: Repository<ProductLog>,
  ) {}

  protected async getActiveLogOrThrow(id: string): Promise<ProductLog> {
    const log = await this.logRepo.findOne({
      where: { id, isActive: true },
      relations: ['product', 'productBatch'],
    });
    if (!log) throw new NotFoundException('Mahsulot logi topilmadi');
    return log;
  }
}
