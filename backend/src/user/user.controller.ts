// user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/public.decorator';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import * as paginationUtil from 'src/common/utils/pagination.util';
import { AuthService } from '../auth/services/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';

function toUserResponse(u: User): UserResponseDto {
  if (!u) return null as unknown as UserResponseDto;
  const { id, username, createdAt, updatedAt } = u;
  return { id, username, createdAt, updatedAt } as UserResponseDto;
}

@ApiTags('Users')
@Controller('api/users')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly authService: AuthService,
  ) {}
  @Public()
  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const tokens = await this.authService.login(user);
    return { user: toUserResponse(user), auth: tokens };
  }
  @Public()
  @Get()
  @ApiResponse({ status: 200, description: 'All users paginated with filters' })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<paginationUtil.PaginationResult<UserResponseDto>> {
    return this.usersService.findAll(query);
  }
  @Public()
  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'User found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto | null> {
    const user = await this.usersService.findOne(id);
    return user ? toUserResponse(user) : null;
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    const user = await this.usersService.update(id, updateData);
    return toUserResponse(user);
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
