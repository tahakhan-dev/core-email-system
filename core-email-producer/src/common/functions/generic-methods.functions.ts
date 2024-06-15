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

    getTokenExpirationTime(expiresIn): Date {
        try {
            const currentTime = new Date().getTime(); // Current time in milliseconds
            const expiresInMillis = expiresIn * 1000; // Convert expires_in from seconds to milliseconds
            const expirationTime = new Date(currentTime + expiresInMillis);
            return expirationTime;

        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    isTokenExpired(expirationTime) {
        try {
            const currentTime = new Date();
            return true
            // return expirationTime <= currentTime;
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }



}
