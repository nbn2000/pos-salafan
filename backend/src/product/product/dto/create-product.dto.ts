import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { MeasurementType, Priority } from 'src/common/enums/enum';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1, description: 'How many products to produce' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    example: 50000,
    nullable: true,
    description: 'Per-unit cost for initial batch',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cost?: number | null;

  @ApiProperty({ enum: MeasurementType, example: MeasurementType.KG })
  @IsEnum(MeasurementType)
  type: MeasurementType;

  @ApiPropertyOptional({ enum: Priority, example: Priority.LOW })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ example: 100000, nullable: true })
  @IsOptional()
  @ValidateIf(
    (o: CreateProductDto) =>
      o.sellPrice === null || typeof o.sellPrice === 'number',
  )
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sellPrice?: number | null;
}
