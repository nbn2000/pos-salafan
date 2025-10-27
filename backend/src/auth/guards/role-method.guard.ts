import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PUBLIC_PATHS } from '../constants/public-paths';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

type Role = 'ADMIN' | 'WORKER';

interface AuthUser {
  id: string;
  role: Role;
}

const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class RoleMethodGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const method = (req.method || '').toUpperCase();
    const url = req.url || '';

    // 1) @Public() routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    // 2) Public paths (swagger/health)
    if (PUBLIC_PATHS.some((rx) => rx.test(url))) return true;

    // 3) Must be authenticated (JwtAuthGuard should have set req.user)
    const user = req.user;
    if (!user) throw new UnauthorizedException('Avtorizatsiya talab qilinadi.');

    // 4) Role rules
    if (user.role === 'ADMIN') return true;
    if (user.role === 'WORKER') {
      if (READ_ONLY_METHODS.has(method)) return true;
      throw new ForbiddenException('Ishchilar faqat o‘qish huquqiga ega.');
    }

    throw new ForbiddenException('Ruxsat etilmagan.');
  }
}
