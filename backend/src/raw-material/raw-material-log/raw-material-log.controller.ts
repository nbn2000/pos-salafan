import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RawMaterialLogQueryDto } from './dto/raw-material-log-query.dto';
import { RawMaterialLogListResult, RawMaterialLogResult } from './helper';
import { RawMaterialLogService } from './services/raw-material-log.service';

@ApiTags('RawMaterialLog')
@Controller('api/raw-material-log')
export class RawMaterialLogController {
  constructor(private readonly service: RawMaterialLogService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Xomashyo loglari ro`yxati (sahifalangan)' })
  @ApiQuery({ name: 'type', required: false, enumName: 'RawMaterialLogType', enum: ['ADD','ADD-BATCH','CHANGE','CHANGE-BATCH','DELETE','DELETE-BATCH'], description: 'Filter by log type' })
  findAll(@Query() query: RawMaterialLogQueryDto) {
    return this.service.findAll(query);
  }

  @Get('logs')
  @ApiResponse({ status: 200, description: 'Sahifalangan xomashyo loglari (partiya va xomashyo bilan birga)' })
  @ApiQuery({ name: 'type', required: false, enumName: 'RawMaterialLogType', enum: ['ADD','ADD-BATCH','CHANGE','CHANGE-BATCH','DELETE','DELETE-BATCH'], description: 'Filter by log type' })
  findLogs(
    @Query() query: RawMaterialLogQueryDto,
  ): Promise<RawMaterialLogListResult> {
    return this.service.findLogs(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Xomashyo logi topildi' })
  findOne(@Param('id') id: string): Promise<RawMaterialLogResult> {
    return this.service.findOne(id);
  }
}