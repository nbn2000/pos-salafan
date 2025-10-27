import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentResult } from './helper';
import { PaymentService } from './services/payment.service';

@ApiTags('Payment')
@Controller('api/payment')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Payment created' })
  create(@Body() dto: CreatePaymentDto): Promise<PaymentResult> {
    return this.service.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of payments (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Payment found' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PaymentResult> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Payment updated' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdatePaymentDto,
  ): Promise<PaymentResult> {
    return this.service.update(id, dto);
  }
}
