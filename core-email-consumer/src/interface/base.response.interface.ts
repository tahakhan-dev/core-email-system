
import { EmailEntity } from "src/modules/email/entities/email.entity"
import { StatusCodes } from "src/common/enums/status-codes.enum"
import { Status } from "src/common/enums/status.enum"

export interface IResponseWrapper<T> {
    statusCode: StatusCodes,
    result?: Partial<T>,
    status: Status,
    message: string
}

export interface IDecryptWrapper {
    id: number,
    userName: string,
    email: string,
    iat: number,
    exp: number
    iss: string,
    sub: string
}

export interface ILoggerMapper {
    consumerId: string,
    body?: string,
    params?: string,
    query?: string,
    invokationRestMethod: string,
    invokationApiUrl: string,
    invokationIp: string,
    invokationUserAgent: string,
    invokationController: string
    invokationMethod: string
    apiMessage?: string;
    completionTime: string,
    statusCode: number
}

export interface IEmailResponse {
    statusCode?: StatusCodes,
    status: Status
    result?: Partial<EmailEntity[]>
    message?: string
}


export interface IDeviceToken {
    UniqueIdentifier: string,
    authToken: string
}