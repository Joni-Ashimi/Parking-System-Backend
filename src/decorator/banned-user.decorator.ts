import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common';

@Injectable()
export class BannedUserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user && user.verificationStatus === 'banned') {
            throw new ForbiddenException('Your account is banned. You cannot perform this action.');
        }

        return true;
    }
}