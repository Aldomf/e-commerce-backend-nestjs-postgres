import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Get the JWT token from the request headers
    const token = request.headers.authorization?.split(' ')[1];

    try {
      // Decode the token to extract the payload
      const decoded = this.jwtService.verify(token);

      // Check if the user has admin role
      if (decoded.role === 'admin') {
        return true; // User is an admin, allow access
      }
    } catch (error) {
      // Token verification failed or user doesn't have admin role
    }

    // If user is not an admin or token verification fails, throw an unauthorized exception
    throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
  }
}
