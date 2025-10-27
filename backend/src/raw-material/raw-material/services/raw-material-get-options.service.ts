// src/raw-material/raw-material/services/raw-material-get-options.service.ts
import { Injectable } from '@nestjs/common';
import { CreateRawMaterialOptions } from '../helper';
import { RawMaterialBaseService } from './raw-material-base.service';

@Injectable()
export class RawMaterialGetOptionsService extends RawMaterialBaseService {
  async getCreateOptions(): Promise<CreateRawMaterialOptions> {
    const [suppliers, users] = await Promise.all([
      this.supplierRepo.find({ where: { isActive: true } }),
      this.userRepo.find({ where: { isActive: true } }),
    ]);
    return {
      suppliers: suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
      })),
      users: users.map((u) => ({ id: u.id, username: u.username })),
    };
  }
}
