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
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { DebtResult } from './helper';
import { DebtService } from './services/debt.service';

@ApiTags('Debt')
@Controller('api/debt')
export class DebtController {
  constructor(private readonly service: DebtService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Qarz yaratildi' })
  create(@Body() dto: CreateDebtDto): Promise<DebtResult> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<DebtResult> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateDebtDto,
  ): Promise<DebtResult> {
    return this.service.update(id, dto);
  }
}
