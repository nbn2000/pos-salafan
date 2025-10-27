import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsUUID, Min, ValidateIf } from 'class-validator';

export class CreateProductBatchDto {
  @ApiProperty({ format: 'uuid', description: 'Existing product ID' })
  @IsUUID()
  productId: string;

  // recipe/assembler removed

  @ApiProperty({ example: 1, description: 'How many products to produce' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 50000, nullable: true, description: 'Per-unit cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number | null;

  @ApiPropertyOptional({ example: 100000, nullable: true })
  @IsOptional()
  @ValidateIf(
    (o: CreateProductBatchDto) =>
      o.sellPrice === null || typeof o.sellPrice === 'number',
  )
  @IsNumber()
  @Min(0)
  sellPrice?: number | null;
}
