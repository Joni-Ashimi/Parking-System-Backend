import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        const now = Date.now();

        const request = context.switchToHttp().getRequest();
        const user = request.user ? request.user?.name : 'Guest User';
        const method = request.method;
        const url = request.url;

        return next.handle().pipe(
            tap(() => {
                console.log(`Completed ${method} ${url} in ${Date.now() - now} ms`);
            }),
            catchError((err) => {
                console.error(
                    `Error in ${method} ${url} ${err.message} ${Date.now() - now} ms`,
                );
                return throwError(() => err);
            }),
        );
    }
}