import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionPagedResult, TransactionResult } from './helper';
import { TransactionService } from './services/transaction.service';

@ApiTags('Transaction')
@Controller('api/transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Sale transaction created' })
  create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: User,
  ): Promise<TransactionResult> {
    return this.transactionService.create(dto, user.id);
  }

  @Post(':id/revert')
  @ApiResponse({
    status: 200,
    description:
      'Fully revert a transaction: restore stock and cancel related finance.',
  })
  revert(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: User,
  ): Promise<TransactionResult> {
    return this.transactionService.revert(id, user.id);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of transactions (paginated)' })
  findAll(
    @Query() query: TransactionQueryDto,
  ): Promise<TransactionPagedResult> {
    return this.transactionService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Transaction found' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<TransactionResult> {
    return this.transactionService.findOne(id);
  }
}
