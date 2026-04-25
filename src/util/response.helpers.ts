export const normalizeResponse = (res: any) => {
    let message: any = '';
    let data: any = {};
    let errors = [];

    if (typeof res === 'string' || res instanceof String) {
        message = res;
    } else if (res instanceof Object) {
        if (res._message) {
            message = res._message;
            delete res._message;
        }
        if (res._errors) {
            errors = res._errors;
            delete res._errors;
        }
        data = res;
    }

    return {
        message,
        data,
        errors,
    };
};