import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as helper from './helper';
import { SaleService } from './services/sale.service';

@ApiTags('Sale')
@Controller('api/sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description:
      'List of products with stock. Supports filters and manual pagination.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 6 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'sugar' })
  @ApiQuery({
    name: 'searchField',
    required: false,
    type: String,
    example: 'name',
  })
  @ApiQuery({
    name: 'sortField',
    required: false,
    type: String,
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @ApiQuery({
    name: 'createdFrom',
    required: false,
    type: String,
    example: '2025-09-01',
  })
  @ApiQuery({
    name: 'createdTo',
    required: false,
    type: String,
    example: '2025-10-01',
  })
  @ApiQuery({ name: 'includeBatches', required: false, type: Boolean })
  findAll(
    @Query() query: helper.PaginationQuery,
  ): Promise<helper.PagedResult<helper.SaleItem>> {
    return this.saleService.findAll(query);
  }

  @Get('one')
  @ApiResponse({
    status: 200,
    description: 'Fetch a product by id. Optionally include active batches.',
  })
  @ApiQuery({ name: 'productId', required: true, type: String })
  @ApiQuery({ name: 'includeBatches', required: false, type: Boolean })
  findOne(
    @Query('productId') productId: string,
    @Query('includeBatches') includeBatches?: string,
  ) {
    return this.saleService.findOne({ productId, includeBatches });
  }
}
