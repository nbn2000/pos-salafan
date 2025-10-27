// src/raw-material/raw-material/services/raw-material-find-one.service.ts
import { Injectable } from '@nestjs/common';
import { RawMaterialResult } from '../helper';
import { RawMaterialBaseService } from './raw-material-base.service';

@Injectable()
export class RawMaterialFindOneService extends RawMaterialBaseService {
  async findOne(id: string): Promise<RawMaterialResult> {
    const entity = await this.getActiveRawOrThrow(id);
    return this.toResult(entity);
  }
}
