// src/client/services/client-update.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateClientDto } from '../dto/update-client.dto';
import { Client } from '../entities/client.entity';
import { ClientResult, toClientResult } from '../helper';

@Injectable()
export class ClientUpdateService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async update(id: string, dto: UpdateClientDto): Promise<ClientResult> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Mijoz topilmadi');

    if (dto.phone && dto.phone !== entity.phone) {
      const exists = await this.repo.findOne({ where: { phone: dto.phone } });
      if (exists)
        throw new BadRequestException('Telefon raqami allaqachon mavjud');
      entity.phone = dto.phone;
    }
    if (dto.name) entity.name = dto.name;

    const saved = await this.repo.save(entity);
    return toClientResult(saved);
  }
}
