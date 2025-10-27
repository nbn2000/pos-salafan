// src/supplier/services/supplier-create.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { Supplier } from '../entities/supplier.entity';
import { SupplierResult, toSupplierResult } from '../helper';

@Injectable()
export class SupplierCreateService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<SupplierResult> {
    const exists = await this.repo.findOne({ where: { phone: dto.phone } });
    if (exists)
      throw new BadRequestException('Telefon raqami allaqachon mavjud');

    const entity = this.repo.create({ name: dto.name, phone: dto.phone });
    const saved = await this.repo.save(entity);
    return toSupplierResult(saved);
  }
}
