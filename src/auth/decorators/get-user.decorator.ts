import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { ActiveUser } from '../interfaces/active-user.interface';

export const GetUser = createParamDecorator(
  (data: keyof ActiveUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: ActiveUser }>();
    const user = request.user as ActiveUser;

    return data ? user?.[data] : user;
  },
);
