// src/supplier/services/supplier-remove.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { SupplierDeletedResult, toSupplierResult } from '../helper';

@Injectable()
export class SupplierRemoveService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async remove(id: string): Promise<SupplierDeletedResult> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Ta’minotchi topilmadi');

    entity.isActive = false;
    entity.deletedAt = new Date();
    const saved = await this.repo.save(entity);

    return { ...toSupplierResult(saved), deletedAt: saved.deletedAt! };
  }
}
