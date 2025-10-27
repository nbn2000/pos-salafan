import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
// import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { RawMaterialQueryDto } from './dto/raw-material-query.dto';
import { PaymentType, Priority } from 'src/common/enums/enum';
import { User } from 'src/user/entities/user.entity';
import { CreateRawMaterialCombinedDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { CreateRawMaterialOptions, RawMaterialRefillItem, RawMaterialResult, RawWithBatchesPagedWithTotals, RawWithBatchesResult } from './helper';
import { RawMaterialService } from './services/raw-material.service';

@ApiTags('Xomashyo')
@Controller('api/raw-material')
export class RawMaterialController {
  constructor(private readonly service: RawMaterialService) {}

  @Get('create/options')
  @ApiResponse({
    status: 200,
    description: 'Xomashyo yaratish uchun kerakli ombor, taâ€™minotchi va foydalanuvchi IDlari',
  })
  getCreateOptions(): Promise<CreateRawMaterialOptions> {
    return this.service.getCreateOptions();
  }

  // list of raw materials that should be refilled (totalAmount <= minAmount)
  @Get('to-fill-store')
  @ApiResponse({
    status: 200,
    description: 'Zaxirasi belgilangan minimal miqdordan kam yoki teng boâ€˜lgan xomashyolar',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          link: { type: 'string', example: '/raw-materials/{rawMaterial.id}' },
        },
      },
    },
  })
  findToFillStore(): Promise<RawMaterialRefillItem[]> {
    return this.service.findToRefillStore();
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Paxta' },
        type: { type: 'string', enum: ['KG', 'UNIT'] },
        priority: { type: 'string', enum: Object.values(Priority), example: 'LOW', nullable: true },
        paid: { type: 'number', example: 0, nullable: true },
        paymentType: { type: 'string', enum: Object.values(PaymentType), nullable: true },
        supplierId: { type: 'string', format: 'uuid' },
        batch: {
          type: 'object',
          properties: {
            amount: { type: 'number', example: 100 },
            buyPrice: { type: 'number', example: 40000 },
          },
          required: ['amount', 'buyPrice'],
        },
      },
      required: ['name', 'type', 'batch', 'supplierId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Xomashyo yaratildi (batch, log, toâ€˜lov/qarz bilan)' })
  create(
    @Body() dto: CreateRawMaterialCombinedDto,
    @CurrentUser() user: User,
  ): Promise<RawMaterialResult> {
    return this.service.createWithBatchAndFinance(dto, undefined, user?.id);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Xomashyo roâ€˜yxati (sahifalangan)' })
  findAll(@Query() query: RawMaterialQueryDto) {
    return this.service.findAll(query);
  }

  @Get('with-batches')
  @ApiResponse({ status: 200, description: 'Xomashyo roâ€˜yxati (sahifalangan) va batchlar bilan birga' })
  findAllWithBatches(
    @Query() query: RawMaterialQueryDto,
  ): Promise<RawWithBatchesPagedWithTotals> {
    return this.service.findAllWithBatches(query);
  }

  @Get(':id/batches')
  @ApiResponse({ status: 200, description: 'Bitta xomashyo va uning batchlari (sahifalangan)' })
  findOneWithBatches(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<RawWithBatchesResult> {
    return this.service.findOneWithBatches(id);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Xomashyo topildi' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<RawMaterialResult> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Xomashyo yangilandi' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateRawMaterialDto,
  ): Promise<RawMaterialResult> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Xomashyo oâ€˜chirildi (soft delete)' })
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.remove(id);
  }
}

