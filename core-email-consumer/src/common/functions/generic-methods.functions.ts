import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Response } from 'express';

@Injectable()
export class GenericFunctions {  // class related to token 

    settingResponseHeader(response: Response, headerKey: string[], headerValue: string[]) {
        try {
            if (headerKey?.length !== headerValue?.length) {
                throw new Error('Array must have the same length')
            }
            for (let i = 0; i < headerKey?.length; i++) {
                response.setHeader(headerKey[i], headerValue[i])
            }
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}
