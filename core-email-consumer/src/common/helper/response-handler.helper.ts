import { IResponseWrapper } from "src/interface/base.response.interface";
import { StatusCodes } from "../enums/status-codes.enum";
import { Status } from "../enums/status.enum";

export function responseHandler<T>(result: Partial<T> | null, message: string, status: Status, statusCode: StatusCodes): IResponseWrapper<T> {

    const response: IResponseWrapper<T> = {
        statusCode,
        status,
        message,
    };

    if (result !== null) {
        response.result = result;
    }

    return response;

}