import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { RawMaterialLogType } from 'src/common/enums/enum';

export class RawMaterialLogQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RawMaterialLogType, description: 'Filter by log type' })
  @IsOptional()
  @IsEnum(RawMaterialLogType)
  type?: RawMaterialLogType;
}

