import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // This allows the request to pass through even if no token is provided
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // Don't throw an error if no user is found
    // Just return null and let the controller handle it
    if (err || !user) {
      return null;
    }
    return user;
  }
}
