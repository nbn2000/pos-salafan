// src/client/services/client-create.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from '../dto/create-client.dto';
import { Client } from '../entities/client.entity';
import { ClientResult, toClientResult } from '../helper';

@Injectable()
export class ClientCreateService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async create(dto: CreateClientDto): Promise<ClientResult> {
    const exists = await this.repo.findOne({ where: { phone: dto.phone } });
    if (exists)
      throw new BadRequestException('Telefon raqami allaqachon mavjud');

    const entity = this.repo.create({ name: dto.name, phone: dto.phone });
    const saved = await this.repo.save(entity);
    return toClientResult(saved);
  }
}
