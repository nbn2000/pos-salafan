import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { MeasurementType, PaymentType, Priority } from 'src/common/enums/enum';

export class CreateRawMaterialDto {
  @ApiProperty({ example: 'Paxta', description: 'Xomashyo nomi' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: MeasurementType, example: MeasurementType.KG })
  @IsEnum(MeasurementType)
  type: MeasurementType;

  @ApiPropertyOptional({ enum: Priority, example: Priority.LOW })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  // minAmount removed from business logic
}

export class CreateRawMaterialBatchInlineDto {
  @ApiProperty({ example: 100, description: 'Miqdor' })
  @IsNumber()
  @Min(0.000001)
  amount: number;

  @ApiProperty({ example: 40000, description: 'Sotib olish narxi' })
  @IsNumber()
  @Min(0.000001)
  buyPrice: number;


}

export class CreateRawMaterialCombinedDto extends CreateRawMaterialDto {
  @ApiProperty({
    type: CreateRawMaterialBatchInlineDto,
    description: 'Partiya maʼlumotlari',
  })
  @ValidateNested()
  @Type(() => CreateRawMaterialBatchInlineDto)
  batch: CreateRawMaterialBatchInlineDto;

  @ApiPropertyOptional({ example: 200, description: 'To‘langan summa' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paid?: number = 0;

  @ApiProperty({
    example: 'uuid-of-supplier',
    description: 'Taʼminotchining UUID identifikatori',
  })
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ enum: PaymentType, example: PaymentType.CASH })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;
}
