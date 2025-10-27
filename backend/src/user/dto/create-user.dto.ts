// dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(5, { message: "Parol kamida 5 ta belgidan iborat bo'lishi kerak" })
  @Matches(/[A-Za-z]/, {
    message: "Parolda kamida bitta harf bo'lishi shart",
  })
  password: string;
}

