import { IDecryptWrapper } from '../../interface/base.response.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';
import { createHash } from 'crypto';
import { Request } from 'express';

@Injectable()
export class TokenFunctions {  // class related to token 
    constructor(
        private authService: AuthService
    ) { }

    decryptUserToken(request: Request): IDecryptWrapper | any { // Decrypting the token extracted from the request header.
        try {
            const authorizationHeader: string = request?.headers['authorization']
            if (authorizationHeader) {

                const consumerToken: string = authorizationHeader?.replace('Bearer', '').trim()
                let decryptToken: IDecryptWrapper = this.authService?.decodeJWT(consumerToken) as IDecryptWrapper
                return decryptToken
            }
            return true

        } catch (error) {
            throw new UnauthorizedException()
        }
    }

    getUniqueIdentifierFromHeader(request: Request): string {
        try {
            const deviceId = request?.headers['deviceid'] as string
            return deviceId
        } catch (error) {
            throw new UnauthorizedException()
        }
    }

    getUserToken(request: Request): string | boolean { // getting user token from headers
        try {
            const authorizationHeader: string = request?.headers['authorization']
            if (authorizationHeader) {

                const consumerToken: string = authorizationHeader.replace('Bearer', '').trim()
                return consumerToken
            }
            return true

        } catch (error) {
            throw new UnauthorizedException()
        }
    }

    generateDynamicJwtSecretKey(userName: string): string {
        try {
            const secretAttributes: string = userName;
            const secretKey: string = createHash('sha256')?.update(JSON.stringify(secretAttributes))?.digest('hex');
            return secretKey
        } catch (error) {
            throw new UnauthorizedException()
        }

    }
}
