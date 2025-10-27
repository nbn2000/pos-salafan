import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { CreateProductBatchDto } from './dto/create-product-batch.dto';
import { UpdateProductBatchDto } from './dto/update-product-batch.dto';
import { ProductBatch } from './entities/product-batch.entity';
import { ProductBatchService } from './services/product-batch.service';

@ApiTags('ProductBatch')
@Controller('api/product-batch')
export class ProductBatchController {
  constructor(private readonly service: ProductBatchService) {}

  @Post()
  @ApiResponse({ status: 201, type: ProductBatch })
  create(@Body() dto: CreateProductBatchDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOkResponse({ type: [ProductBatch] })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductBatch })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProductBatch })
  update(@Param('id') id: string, @Body() dto: UpdateProductBatchDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ProductBatch })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // 🔹 Get paginated batches by productId
  @Get('product/:productId')
  @ApiOkResponse({ type: [ProductBatch] })
  findByProductPaginated(
    @Param('productId') productId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findByProductPaginated(productId, query);
  }

  // 🔹 Get all batches by productId (no pagination)
  @Get('product/:productId/all')
  @ApiOkResponse({ type: [ProductBatch] })
  findByProductAll(
    @Param('productId') productId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findByProductAll(productId, query);
  }
}
