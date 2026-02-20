/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

type JwtPayload = {
  sub: number;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'jwt_secret',
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.authService.getUserById(payload.sub);

      return {
        ...user,
        role: payload.role,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
