import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface AuthUser { id: string }

const PUBLIC_PATHS: RegExp[] = [
  /^\/api\/docs(\/|$)/,
  /^\/api-json$/,
  /^\/health$/,
];

@Injectable()
export class JwtRoleGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const method = (req.method || '').toUpperCase();
    const url = req.url || '';

    if (method === 'OPTIONS') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic || PUBLIC_PATHS.some((rx) => rx.test(url))) return true;

    await super.canActivate(ctx);

    const user = req.user;
    if (!user) throw new UnauthorizedException('Avtorizatsiya talab qilinadi.');
    return true;
  }

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      throw (err as Error) ?? new UnauthorizedException("Token noto‘g‘ri yoki yo‘q.");
    }
    return user as TUser;
  }
}

