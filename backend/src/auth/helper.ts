export interface AccessPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface RefreshPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}
