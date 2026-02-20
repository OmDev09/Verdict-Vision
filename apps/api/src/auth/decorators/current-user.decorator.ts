import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  credits: number;
  enrollmentNo?: string | null;
  lawyerVerificationStatus?: string | null;
}

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): CurrentUserPayload => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
