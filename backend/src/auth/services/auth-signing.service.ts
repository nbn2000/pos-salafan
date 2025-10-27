import { Injectable } from '@nestjs/common';
import { AccessPayload, RefreshPayload } from '../helper';
import { AuthBaseService } from './auth-base.service';

type MinimalUser = { id: string; username: string };

@Injectable()
export class AuthSigningService extends AuthBaseService {
  async signTokens(user: MinimalUser): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const payload: AccessPayload = { sub: user.id, username: user.username };

    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: this.accessExpires,
      }),
      this.jwt.signAsync(payload as RefreshPayload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpires,
      }),
    ]);

    return { access_token, refresh_token };
  }

  async verifyAccess(token: string): Promise<AccessPayload> {
    return this.jwt.verifyAsync<AccessPayload>(token, {
      secret: this.accessSecret,
    });
  }

  async verifyRefresh(token: string): Promise<RefreshPayload> {
    return this.jwt.verifyAsync<RefreshPayload>(token, {
      secret: this.refreshSecret,
    });
  }

  /** Best-effort decode to extract `sub` when both verifications fail. */
  decodeSub(token: string): string | undefined {
    const decoded: null | string | Record<string, unknown> =
      this.jwt.decode(token);
    if (decoded && typeof decoded === 'object' && 'sub' in decoded) {
      const anyDec = decoded as { sub?: unknown };
      if (typeof anyDec.sub === 'string') return anyDec.sub;
    }
    return undefined;
  }
}
