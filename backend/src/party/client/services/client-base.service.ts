// src/client/services/client-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';

@Injectable()
export class ClientBaseService {
  constructor(
    @InjectRepository(Client)
    protected readonly repo: Repository<Client>,
  ) {}

  protected async getActiveClientOrThrow(id: string): Promise<Client> {
    const entity = await this.repo.findOne({ where: { id, isActive: true } });
    if (!entity) throw new NotFoundException('Mijoz topilmadi');
    return entity;
  }
}
