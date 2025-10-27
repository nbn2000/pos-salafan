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
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { ClientsProductsFinancePagedDto } from './dto/clients-products-finance.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import {
  ClientProductsFinanceRow,
  ClientResult,
  ClientsProductsFinancePaged,
} from './helper';
import { ClientService } from './services/client.service';

@ApiTags('Client')
@Controller('api/client')
export class ClientController {
  constructor(private readonly service: ClientService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Client created' })
  create(@Body() dto: CreateClientDto): Promise<ClientResult> {
    return this.service.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of clients (paginated)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  // ✅ STATIC ROUTE — must be ABOVE ":id"
  @Get('products-finance')
  @ApiOkResponse({
    description:
      'Finance grouped by products for ALL clients on this page (paginated).',
    type: ClientsProductsFinancePagedDto, // <-- use DTO class here
  })
  productsFinanceAll(@Query() query: PaginationQueryDto) {
    return this.service.findAllProductsFinance(query);
  }

  @Get('finance/debts')
  @ApiOkResponse({
    description: 'List of clients with unpaid debts (paginated)',
    type: ClientsProductsFinancePagedDto, // <-- use DTO class here
  })
  async findAllWithDebts(
    @Query() query: PaginationQueryDto,
  ): Promise<ClientsProductsFinancePaged> {
    return this.service.findAllWithDebts(query);
  }

  // ✅ per-client finance (also above ":id" to be extra safe)
  @Get(':id/products-finance')
  @ApiResponse({
    status: 200,
    description:
      'All products finance for this client (non-paginated, includes soft-deleted related rows).',
  })
  productsFinanceByClient(
    @Param('id', new ParseUUIDPipe({ version: '4' })) clientId: string,
  ): Promise<ClientProductsFinanceRow> {
    return this.service.findProductsFinance(clientId);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Client found' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ClientResult> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Client updated' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<ClientResult> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Client deleted (soft)' })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UpdateClientDto> {
    return this.service.remove(id);
  }
}
