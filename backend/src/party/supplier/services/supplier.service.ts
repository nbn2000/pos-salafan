// src/supplier/services/supplier.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginationResult } from 'src/common/utils/pagination.util';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import {
  SupplierDeletedResult,
  SupplierFinanceRow,
  SupplierResult,
  SuppliersFinancePaged,
} from '../helper';
import { SupplierCreateService } from './supplier-create.service';
import { SupplierFinanceAllService } from './supplier-finance-all.service';
import { SupplierFinanceOneService } from './supplier-finance-one.service';
import { SupplierFindAllService } from './supplier-find-all.service';
import { SupplierFindOneService } from './supplier-find-one.service';
import { SupplierRemoveService } from './supplier-remove.service';
import { SupplierUpdateService } from './supplier-update.service';

@Injectable()
export class SupplierService {
  constructor(
    private readonly creator: SupplierCreateService,
    private readonly finderAll: SupplierFindAllService,
    private readonly finderOne: SupplierFindOneService,
    private readonly updater: SupplierUpdateService,
    private readonly remover: SupplierRemoveService,
    private readonly financeOne: SupplierFinanceOneService,
    private readonly financeAll: SupplierFinanceAllService,
  ) {}

  // CRUD
  create(dto: CreateSupplierDto): Promise<SupplierResult> {
    return this.creator.create(dto);
  }

  findAll(
    query: PaginationQueryDto,
  ): Promise<PaginationResult<SupplierResult>> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<SupplierResult> {
    return this.finderOne.findOne(id);
  }

  update(id: string, dto: UpdateSupplierDto): Promise<SupplierResult> {
    return this.updater.update(id, dto);
  }

  remove(id: string): Promise<SupplierDeletedResult> {
    return this.remover.remove(id);
  }

  // Finance
  findRawMaterialsFinance(supplierId: string): Promise<SupplierFinanceRow> {
    return this.financeOne.findRawMaterialsFinance(supplierId);
  }

  findAllRawMaterialsFinance(
    query: PaginationQueryDto,
  ): Promise<SuppliersFinancePaged> {
    return this.financeAll.findAllRawMaterialsFinance(query);
  }
}
