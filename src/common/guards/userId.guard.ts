import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UserIdGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userIdFromToken = this.getUserIdFromToken(request);
    const userIdFromParams = request.params.userId;

    console.log('Param id:', userIdFromParams);
    console.log('Token id:', userIdFromToken);

    if (
      userIdFromToken &&
      userIdFromParams &&
      userIdFromToken == userIdFromParams
    ) {
      return true;
    }

    throw new ForbiddenException("You're not allowed to access this resource.");
  }

  private getUserIdFromToken(request: Request): string | null {
    const token = request.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = this.jwtService.decode(token) as { sub: string };
      return decoded.sub;
    }
    return null;
  }
}
