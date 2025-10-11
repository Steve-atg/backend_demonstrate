import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  userLevel: number;
  avatar?: string;
  gender: string;
  dateOfBirth?: Date;
  createdAt: Date;
}
