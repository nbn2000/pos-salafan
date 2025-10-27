import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';
import { PaymentType } from 'src/common/enums/enum';

export class CreateRawMaterialBatchDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 40000 })
  @IsNumber()
  @IsPositive()
  buyPrice: number;


  // --- inline finance ---
  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paid?: number = 0;

  @ApiProperty({ example: 'uuid-of-supplier' })
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ enum: PaymentType, example: PaymentType.CASH })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;
}
