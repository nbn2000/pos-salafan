import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import {
  SupplierFinanceRow,
  SupplierResult,
  SuppliersFinancePaged,
} from './helper';
import { SupplierService } from './services/supplier.service';

@ApiTags('Supplier')
@Controller('api/supplier')
export class SupplierController {
  constructor(private readonly service: SupplierService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Supplier created' })
  create(@Body() dto: CreateSupplierDto): Promise<SupplierResult> {
    return this.service.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of suppliers (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  // ✅ STATIC route (must be above ":id")
  @Get('raw-materials-finance')
  @ApiResponse({
    status: 200,
    description:
      'Finance grouped by raw materials for ALL suppliers on this page (paginated).',
  })
  rawMaterialsFinanceAll(
    @Query() query: PaginationQueryDto,
  ): Promise<SuppliersFinancePaged> {
    return this.service.findAllRawMaterialsFinance(query);
  }

  // ✅ Per-supplier finance (non-paginated). Keep above ":id" to avoid route clash.
  @Get(':id/raw-materials-finance')
  @ApiResponse({
    status: 200,
    description:
      'All raw materials finance for this supplier (non-paginated, includes soft-deleted related rows).',
  })
  rawMaterialsFinanceBySupplier(
    @Param('id', new ParseUUIDPipe({ version: '4' })) supplierId: string,
  ): Promise<SupplierFinanceRow> {
    return this.service.findRawMaterialsFinance(supplierId);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Supplier found' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<SupplierResult> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Supplier updated' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<SupplierResult> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Supplier deleted (soft)' })
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.remove(id);
  }
}
