import { UserEntity } from '../user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';


@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
    ) { }

    async generateJWTToken(userDetail: UserEntity, uniqueIdentifier: string): Promise<any> {
        try {

            const consumerToken: string = await this.jwtService.signAsync({
                id: userDetail?.id,
                userName: userDetail?.userName,
                email: userDetail?.email,
            }, { secret: userDetail?.tokenSecretKey, subject: `${userDetail?.id} Authentication Token`, issuer: `${uniqueIdentifier}` });

            return consumerToken

        } catch (error) {
            return { encryptToken: "", error: true, errorMessage: error?.message, statusCode: error?.response?.status ? error?.response?.status : 500 }
        }
    }

    decodeJWT(authToken: string): Object {
        return this.jwtService.decode(authToken)
    }


    async hashPassword(password: string): Promise<string> { // remove this function in sdk
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }

    async comparePasswords(newPassword: string, passwortHash: string): Promise<boolean> { // remove this function in sdk
        return bcrypt.compare(newPassword, passwortHash);
    }



}
