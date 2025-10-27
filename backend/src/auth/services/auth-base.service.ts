import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthBaseService {
  constructor(
    protected readonly jwt: JwtService,
    protected readonly config: ConfigService,
    @InjectRepository(User) protected readonly usersRepo: Repository<User>,
  ) {}

  protected get accessSecret(): string {
    return this.config.get<string>('JWT_SECRET', { infer: true }) || 'changeme';
  }

  protected get refreshSecret(): string {
    return (
      this.config.get<string>('JWT_REFRESH_SECRET', { infer: true }) ||
      'changeme'
    );
  }

  protected get accessExpires(): string {
    return this.config.get<string>('JWT_EXPIRES') || '15m';
  }

  protected get refreshExpires(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRES') || '7d';
  }
}
