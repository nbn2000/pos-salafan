// src/client/services/client-remove.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { ClientDeletedResult, toClientResult } from '../helper';

@Injectable()
export class ClientRemoveService {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  async remove(id: string): Promise<ClientDeletedResult> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Mijoz topilmadi');

    entity.isActive = false;
    entity.deletedAt = new Date();
    const saved = await this.repo.save(entity);

    return { ...toClientResult(saved), deletedAt: saved.deletedAt! };
  }
}
