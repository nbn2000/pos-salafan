import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID, Min, ValidateNested } from 'class-validator';
import { PaymentType } from 'src/common/enums/enum';

class CreateTransactionProductItemDto {
  @ApiProperty({ format: 'uuid', description: 'Product id being sold' })
  @IsUUID()
  productId: string;

  @ApiProperty({
    example: 10,
    description: 'How many units of the product to sell',
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: 1500000,
    description: 'Per-unit sold price in UZS (nullable)',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  soldPrice?: number | null;

  // serviceCharge removed
}

export class CreateTransactionDto {
  @ApiProperty({ format: 'uuid', description: 'Client who buys' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ type: [CreateTransactionProductItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionProductItemDto)
  products: CreateTransactionProductItemDto[];

  @ApiPropertyOptional({
    example: 5_000_000,
    description: 'Paid amount (default 0)',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  paid?: number = 0;

  @ApiPropertyOptional({ enum: PaymentType, example: PaymentType.CASH })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  // shouldPayDate removed

  @ApiPropertyOptional({
    example: 'Retail sale #123',
    description: 'Optional comment',
  })
  @IsOptional()
  @IsNotEmpty()
  comment?: string;
}
