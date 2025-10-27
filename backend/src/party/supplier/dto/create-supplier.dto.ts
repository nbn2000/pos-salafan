import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Acme Supplies' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
