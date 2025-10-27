import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { PaginationResult } from 'src/common/utils/pagination.util';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentResult } from '../helper';
import { PaymentCreateService } from './payment-create.service';
import { PaymentFindAllService } from './payment-find-all.service';
import { PaymentFindOneService } from './payment-find-one.service';
import { PaymentUpdateService } from './payment-update.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly creator: PaymentCreateService,
    private readonly finderAll: PaymentFindAllService,
    private readonly finderOne: PaymentFindOneService,
    private readonly updater: PaymentUpdateService,
  ) {}

  create(dto: CreatePaymentDto): Promise<PaymentResult> {
    return this.creator.create(dto);
  }

  findAll(query: PaginationQueryDto): Promise<PaginationResult<PaymentResult>> {
    return this.finderAll.findAll(query);
  }

  findOne(id: string): Promise<PaymentResult> {
    return this.finderOne.findOne(id);
  }

  update(id: string, dto: UpdatePaymentDto): Promise<PaymentResult> {
    return this.updater.update(id, dto);
  }
}
