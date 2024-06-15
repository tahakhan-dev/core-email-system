import { IDecryptWrapper } from '../../interface/base.response.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class TokenFunctions {  // class related to token 
    constructor(
        private readonly jwtService: JwtService,
    ) { }

    decryptUserToken(request: Request): IDecryptWrapper | any { // Decrypting the token extracted from the request header.
        try {
            const authorizationHeader: string = request?.headers['authorization']
            if (authorizationHeader) {

                const consumerToken: string = authorizationHeader?.replace('Bearer', '').trim()
                let decryptToken: IDecryptWrapper = this.jwtService.decode(consumerToken) as IDecryptWrapper
                return decryptToken
            }
            return true
        } catch (error) {
            throw new UnauthorizedException(error)
        }
    }
}
