// src/client/services/client-find-one.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { ClientResult, toClientResult } from '../helper';

@Injectable()
export class ClientFindOneService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async findOne(id: string): Promise<ClientResult> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Mijoz topilmadi');
    return toClientResult(entity);
  }
}
