import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/services/user.service';

interface JwtAccessPayload {
  sub: string; // user id
  username: string;
}

function flexibleTokenExtractor(req: Request): string | null {
  if (!req) return null;

  // Accept common header names
  const rawAuth =
    req.headers['authorization'] ??
    (req.headers['Authorization'] as string | undefined) ??
    (req.headers['AUTHORIZATION'] as string | undefined);

  const xToken =
    (req.headers['x-access-token'] as string | undefined) ??
    (req.headers['X-Access-Token'] as string | undefined) ??
    (req.headers['xAccessToken'] as string | undefined);

  const source = (rawAuth && rawAuth.trim()) || (xToken && xToken.trim());
  if (!source) return null;

  // Handle: "<token>", "Bearer <token>", "bearer <token>", "Bearer Bearer <token>"
  const parts = source.split(/\s+/);
  const token = parts[parts.length - 1]; // always take last segment
  return token || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UserService,
  ) {
    super({
      // Use a robust extractor that tolerates various formats/headers
      jwtFromRequest: ExtractJwt.fromExtractors([flexibleTokenExtractor]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET', { infer: true }) || 'changeme',
    });
  }

  async validate(payload: JwtAccessPayload) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || user.isActive === false) {
      throw new UnauthorizedException();
    }
    return user; // attaches to req.user
  }
}
