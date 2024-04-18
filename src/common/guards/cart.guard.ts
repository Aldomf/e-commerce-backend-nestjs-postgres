import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class CartGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authenticatedUserId = request.headers['x-user-id'];
    const userIdFromParams = +request.params.userId;
    console.log(authenticatedUserId);
    console.log(userIdFromParams);

    // Check if the authenticated user ID matches the provided user ID
    if (authenticatedUserId && +authenticatedUserId === userIdFromParams) {
      return true;
    }

    throw new ForbiddenException(
      "You're not allowed to add products to another user's cart.",
    );
  }
}
