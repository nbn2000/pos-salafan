import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { RawMaterialLogType } from 'src/common/enums/enum';

export class CreateRawMaterialLogDto {
  @ApiProperty({ example: 'uuid-of-raw-material' })
  @IsUUID()
  @IsNotEmpty()
  rawMaterialId: string;

  @ApiProperty({ example: 'uuid-of-raw-material-batch' })
  @IsUUID()
  @IsNotEmpty()
  rawMaterialBatchId: string;

  @ApiProperty({ example: 'Raw material batch created' })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({
    example: RawMaterialLogType.ADD,
    enum: RawMaterialLogType,
    description: 'Type of the log entry',
  })
  @IsEnum(RawMaterialLogType)
  type: RawMaterialLogType;
}
