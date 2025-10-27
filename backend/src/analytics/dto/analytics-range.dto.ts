import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

// ✅ Base filters shared by all analytics endpoints
export class AnalyticsBaseQueryDto {
  @ApiPropertyOptional({
    example: '2025-01-01',
    description: 'Filter createdAt from (YYYY-MM-DD, inclusive)',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'createdFrom must be in YYYY-MM-DD format',
  })
  createdFrom?: string;

  @ApiPropertyOptional({
    example: '2025-01-31',
    description: 'Filter createdAt to (YYYY-MM-DD, inclusive)',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'createdTo must be in YYYY-MM-DD format',
  })
  createdTo?: string;

  @ApiPropertyOptional({
    example: 'day',
    enum: ['day', 'week', 'month'],
    description: 'Time bucket for time-series (default: day)',
  })
  @IsOptional()
  @IsIn(['day', 'week', 'month'])
  groupBy?: 'day' | 'week' | 'month' = 'day';

  @ApiPropertyOptional({ example: false, description: 'Include only products' })
  @IsOptional()
  @IsBooleanString()
  onlyProducts?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Include only raw materials',
  })
  @IsOptional()
  @IsBooleanString()
  onlyRawMaterials?: string;
}

// ✅ Paged version for list endpoints (e.g., top-products)
export class AnalyticsPagedQueryDto extends AnalyticsBaseQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page (default: 1)' })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page (default: 10)',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @IsPositive()
  take?: number = 10;

  @ApiPropertyOptional({
    example: 'name',
    description: 'Search field (optional)',
  })
  @IsOptional()
  @IsString()
  searchField?: string;

  @ApiPropertyOptional({
    example: 'foo',
    description: 'Search value (optional)',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
