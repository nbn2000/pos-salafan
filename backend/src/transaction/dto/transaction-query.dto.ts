import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

export class TransactionQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Free-text search across client/product/raw material names and comment',
    example: 'john, string, Paxta',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by client' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Filter by product' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['createdAt', 'totalSoldPrice'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'totalSoldPrice'])
  sortBy?: 'createdAt' | 'totalSoldPrice';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDir?: 'ASC' | 'DESC';
}
