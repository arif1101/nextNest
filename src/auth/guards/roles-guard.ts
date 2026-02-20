/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '../entities/user.entity';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorators';

// workflow ->
// client -> jwtauthguard -> validate the token and attach the current user in the request -> rolesguard check if current user role matches the required role -> if match found proceed to controller -> if not forbidden exception

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflactor -> utility that will help to access metadata

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requieredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [
        context.getHandler(), // method level metadata
        context.getClass(),
      ], // class level metadata
    );

    if (!requieredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRequiredRole = requieredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permision');
    }

    return true;
  }
}
