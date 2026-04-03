import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import joi, { AnySchema } from "joi";

@Injectable()
export class ValidationPipe implements PipeTransform {
    private constructor (private readonly schema : joi.AnySchema) {}

    transform(val: any, metadata: ArgumentMetadata) : any {
        const {error, value} = this.schema.validate(val);
        if (error) {
            throw error;
        }
        return value;
    }

    public static from (schema : AnySchema) {
        return new ValidationPipe(schema);
    }
}