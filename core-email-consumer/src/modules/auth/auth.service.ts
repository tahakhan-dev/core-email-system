import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import 'dotenv/config';


@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
    ) { }

    decodeJWT(authToken: string): Object {
        return this.jwtService.decode(authToken)
    }
}
