export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  org?: string;
  iat?: number;
  exp?: number;
}
