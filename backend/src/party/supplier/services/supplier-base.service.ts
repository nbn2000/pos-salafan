// src/supplier/services/supplier-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';

@Injectable()
export class SupplierBaseService {
  constructor(
    @InjectRepository(Supplier)
    protected readonly repo: Repository<Supplier>,
  ) {}

  protected async getActiveSupplierOrThrow(id: string): Promise<Supplier> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Ta’minotchi topilmadi');
    return entity;
  }
}
