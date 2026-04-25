import {
    ArgumentsHost,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError as JoiValidationError } from 'joi';
import {normalizeResponse} from "../util/response.helpers";

export class ErrorResponseNormalizerFilter
    implements ExceptionFilter<HttpException>
{
    private readonly logger = new Logger(ErrorResponseNormalizerFilter.name);

    catch(exception: HttpException, host: ArgumentsHost): any {
        const responseHelper = host.switchToHttp().getResponse<Response>();
        if (exception instanceof JoiValidationError) {
            const response = normalizeResponse({
                _errors: exception.details.map((detail) => ({
                    key: detail.context?.key,
                    message: detail.message,
                    type: detail.type,
                })),
                _message: exception.message,
            });

            return responseHelper
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .json(response);
        }

        if (!(exception instanceof HttpException) || !exception.getStatus) {
            this.logger.error({
                request: responseHelper.req.body,
                exception: exception.stack,
            });

            return responseHelper
                .status(exception['status'] || HttpStatus.INTERNAL_SERVER_ERROR)
                .json(
                    normalizeResponse(
                        exception.message || 'Internal Server Error',
                    ),
                );
        }

        return responseHelper
            .status(exception.getStatus())
            .json(normalizeResponse(exception.message));
    }
}