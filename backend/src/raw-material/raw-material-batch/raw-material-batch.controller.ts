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
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentType } from 'src/common/enums/enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { User } from 'src/user/entities/user.entity';
import { CreateRawMaterialBatchDto } from './dto/create-raw-material-batch.dto';
import { UpdateRawMaterialBatchDto } from './dto/update-raw-material-batch.dto';
import { RawMaterialBatchResult } from './helper';
import { RawMaterialBatchService } from './services/raw-material-batch.service';

@ApiTags('RawMaterialBatch')
@Controller('api/raw-material-batch')
export class RawMaterialBatchController {
  constructor(private readonly service: RawMaterialBatchService) {}

  @Post(':rawMaterialId')
  @ApiBearerAuth('access-token')
  @ApiParam({ name: 'rawMaterialId', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100 },
        buyPrice: { type: 'number', example: 40000 },
        paid: { type: 'number', example: 0, nullable: true },
        supplierId: { type: 'string', format: 'uuid' },
        paymentType: { type: 'string', enum: Object.values(PaymentType), nullable: true },
      },
      required: ['amount', 'buyPrice', 'supplierId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Xomashyo partiyasi yaratildi' })
  create(
    @Param('rawMaterialId', new ParseUUIDPipe({ version: '4' }))
    rawMaterialId: string,
    @Body() dto: CreateRawMaterialBatchDto,
    @CurrentUser() user: User,
  ): Promise<RawMaterialBatchResult> {
    return this.service.create(rawMaterialId, dto, user.id);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  // 🔹 NEW ENDPOINT: get all batches of a raw material (paginated + filters)
  @Get('raw/:rawMaterialId')
  @ApiParam({ name: 'rawMaterialId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Berilgan xomashyo uchun partiyalarning sahifalangan ro‘yxati',
  })
  findByRawMaterial(
    @Param('rawMaterialId', new ParseUUIDPipe({ version: '4' }))
    rawMaterialId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.findByRawMaterial(rawMaterialId, query);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<RawMaterialBatchResult> {
    return this.service.findOne(id);
  }

  @Patch(':id/:rawMaterialId')
  @ApiResponse({ status: 200, description: 'Xomashyo partiyasi yangilandi' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('rawMaterialId', new ParseUUIDPipe({ version: '4' }))
    rawMaterialId: string,
    @Body() dto: UpdateRawMaterialBatchDto,
  ): Promise<RawMaterialBatchResult> {
    return this.service.update(id, rawMaterialId, dto);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.remove(id);
  }
}
