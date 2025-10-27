// financial/payment/dto/create-payment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { PaymentType } from 'src/common/enums/enum';

export class CreatePaymentDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'uuid-of-from-user/supplier/client' })
  @IsUUID()
  from: string;

  @ApiProperty({ example: 'uuid-of-to-user/supplier/client' })
  @IsUUID()
  to: string;

  @ApiPropertyOptional({ example: 'Payment for raw material debt' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: 'uuid-of-transaction' })
  @IsOptional()
  @IsUUID()
  transactionId?: string | null;

  @ApiPropertyOptional({ example: 'uuid-of-rawMaterialLog' })
  @IsOptional()
  @IsUUID()
  rawMaterialLogId?: string | null;

  @ApiProperty({ enum: PaymentType, example: PaymentType.CASH })
  @IsEnum(PaymentType)
  paymentType: PaymentType;
}
