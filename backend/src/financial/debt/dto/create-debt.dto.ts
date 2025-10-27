import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateDebtDto {
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

  @ApiPropertyOptional({ example: 'Debt for raw material purchase' })
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
}
