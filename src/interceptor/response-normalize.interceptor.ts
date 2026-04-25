import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {normalizeResponse} from "../util/response.helpers";

interface Response<T> {
    message?: string;
    data?: T;
    errors?: any[];
}

@Injectable()
export class ResponseNormalizerInterceptor<T>
    implements NestInterceptor<T, Response<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        return next.handle().pipe(map(normalizeResponse));
    }
}