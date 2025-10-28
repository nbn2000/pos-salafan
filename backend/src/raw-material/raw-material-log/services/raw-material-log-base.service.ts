// src/raw-material/raw-material-log/services/raw-material-log-base.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { RawMaterialBatch } from 'src/raw-material/raw-material-batch/entities/raw-material-batch.entity';
import { RawMaterial } from 'src/raw-material/raw-material/entities/raw-material.entity';
import { RawMaterialLog } from '../entities/raw-material-log.entity';

@Injectable()
export class RawMaterialLogBaseService {
  protected readonly RELATIONS = ['rawMaterial', 'rawMaterialBatch'] as const;

  constructor(
    @InjectRepository(RawMaterialLog)
    protected readonly repo: Repository<RawMaterialLog>,
    @InjectRepository(RawMaterial)
    protected readonly rawRepo: Repository<RawMaterial>,
    @InjectRepository(RawMaterialBatch)
    protected readonly batchRepo: Repository<RawMaterialBatch>,
  ) {}

  /** Keep NotFound semantics for fetch-by-id used in findOne/remove */
  protected async getActiveLogOrThrow(id: string): Promise<RawMaterialLog> {
    const entity = await this.repo.findOne({
      where: { id, isActive: true },
      relations: this.RELATIONS as unknown as string[],
    });
    if (!entity) throw new NotFoundException('Xomashyo logi topilmadi');
    return entity;
  }

  /** Load the same logs again but with relations, then merge onto the paged results' order */
  protected async hydrateWithRelations(
    ids: string[],
  ): Promise<Map<string, RawMaterialLog>> {
    if (!ids.length) return new Map();
    // Load logs themselves (including soft-deleted state if any future case)
    const full = await this.repo.find({ where: { id: In(ids) }, withDeleted: true });

    // Preload related RawMaterial and Batch INCLUDING soft-deleted
    const rawIds = Array.from(new Set(full.map((l) => l.rawMaterialId).filter(Boolean)));
    const batchIds = Array.from(new Set(full.map((l) => l.rawMaterialBatchId).filter(Boolean)));

    const [raws, batches] = await Promise.all([
      rawIds.length
        ? this.rawRepo.find({ where: { id: In(rawIds) }, withDeleted: true })
        : Promise.resolve([] as RawMaterial[]),
      batchIds.length
        ? this.batchRepo.find({ where: { id: In(batchIds) }, withDeleted: true })
        : Promise.resolve([] as RawMaterialBatch[]),
    ]);

    const rawById = new Map(raws.map((r) => [r.id, r]));
    const batchById = new Map(batches.map((b) => [b.id, b]));

    for (const l of full) {
      // Attach even if related is soft-deleted to expose name + flags
      if (l.rawMaterialId) {
        const r = rawById.get(l.rawMaterialId);
        if (r) l.rawMaterial = r;
      }
      if (l.rawMaterialBatchId) {
        const b = batchById.get(l.rawMaterialBatchId);
        if (b) l.rawMaterialBatch = b;
      }
    }

    return new Map(full.map((l) => [l.id, l]));
  }

  /** Helpers that return null (so callers can throw BadRequest to match your originals) */
  protected getActiveRaw(id?: string | null): Promise<RawMaterial | null> {
    if (!id) return Promise.resolve(null);
    return this.rawRepo.findOne({ where: { id, isActive: true } });
  }

  protected getActiveBatch(id?: string | null): Promise<RawMaterialBatch | null> {
    if (!id) return Promise.resolve(null);
    return this.batchRepo.findOne({ where: { id, isActive: true } });
  }
}
