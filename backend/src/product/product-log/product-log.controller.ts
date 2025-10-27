import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { ProductLogListResult, ProductLogResult } from './helper';
import { ProductLogService } from './services/product-log.service';
import { ProductLogType } from 'src/common/enums/enum';
import { ProductLogQueryDto } from './dto/product-log-query.dto';

@ApiTags('ProductLog')
@Controller('api/product-log')
export class ProductLogController {
  constructor(private readonly service: ProductLogService) {}

  @Get()
  @ApiOkResponse({ type: Array })
  @ApiQuery({ name: 'type', required: false, enum: ProductLogType, description: 'Filter by log type' })
  findAll(@Query() query: ProductLogQueryDto) {
    return this.service.findAll(query);
  }

  @Get('logs')
  @ApiOkResponse({ type: Array })
  @ApiQuery({ name: 'type', required: false, enum: ProductLogType, description: 'Filter by log type' })
  findLogs(
    @Query() query: ProductLogQueryDto,
  ): Promise<ProductLogListResult> {
    return this.service.findLogs(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: Object })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
