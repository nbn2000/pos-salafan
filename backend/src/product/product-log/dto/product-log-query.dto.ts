import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { ProductLogType } from 'src/common/enums/enum';

export class ProductLogQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ProductLogType, description: 'Filter by log type' })
  @IsOptional()
  @IsEnum(ProductLogType)
  type?: ProductLogType;
}

