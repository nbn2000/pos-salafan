// dto/update-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Old password (required for any update)' })
  @IsString()
  oldPassword: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @Matches(/[A-Za-z]/, {
    message: 'Parolda kamida bitta harf bo‘lishi shart',
  })
  password?: string;

  // role removed
}
