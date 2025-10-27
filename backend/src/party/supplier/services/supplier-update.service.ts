// src/supplier/services/supplier-update.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { Supplier } from '../entities/supplier.entity';
import { SupplierResult, toSupplierResult } from '../helper';

@Injectable()
export class SupplierUpdateService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async update(id: string, dto: UpdateSupplierDto): Promise<SupplierResult> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Ta’minotchi topilmadi');

    if (dto.phone && dto.phone !== entity.phone) {
      const exists = await this.repo.findOne({ where: { phone: dto.phone } });
      if (exists)
        throw new BadRequestException('Telefon raqami allaqachon mavjud');
      entity.phone = dto.phone;
    }

    if (dto.name) entity.name = dto.name;

    const saved = await this.repo.save(entity);
    return toSupplierResult(saved);
  }
}
