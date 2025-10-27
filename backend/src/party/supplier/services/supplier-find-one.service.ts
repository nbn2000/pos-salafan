// src/supplier/services/supplier-find-one.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { SupplierResult, toSupplierResult } from '../helper';

@Injectable()
export class SupplierFindOneService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async findOne(id: string): Promise<SupplierResult> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Ta’minotchi topilmadi');
    return toSupplierResult(entity);
  }
}
