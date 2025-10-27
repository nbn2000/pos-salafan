// src/raw-material/raw-material/services/raw-material-find-to-refill.service.ts
import { Injectable } from '@nestjs/common';
import { RawMaterialBaseService } from './raw-material-base.service';
import { RawMaterialRefillItem } from '../helper';

@Injectable()
export class RawMaterialFindToRefillService extends RawMaterialBaseService {
  findToRefillStore(): Promise<RawMaterialRefillItem[]> {
    // minAmount-based refill logic removed from business requirements
    return Promise.resolve([]);
  }
}
