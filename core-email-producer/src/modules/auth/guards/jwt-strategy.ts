
import { IDecryptWrapper } from '../../../interface/base.response.interface';
import { CacheUserService } from 'src/common/cache/cache-user.service';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import 'dotenv/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @Inject(CacheUserService) private readonly userCacheService: CacheUserService,
        @Inject(AuthService) private readonly authService: AuthService,

    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Retrieving the JWT token from the request header. 
            ignoreExpiration: false,
            secretOrKeyProvider: async (request, token, done) => {  // By using the secretOrKeyProvider option in the JwtStrategy, you can dynamically provide the secret key based on the user's data or any other logic you want to implement.
                let DecryptToken: IDecryptWrapper, cacheResult: UserEntity[], userSecretKey: string;

                DecryptToken = this.authService.decodeJWT(token) as IDecryptWrapper; // Decoding the JWT token to retrieve the information stored within it.
                if (DecryptToken) { // If the JWT token exists, perform the specified actions.
                    cacheResult = JSON.parse(await this.userCacheService?.getUserProfileRedis(DecryptToken.id)) // Retrieving the consumerProfile cache result from Redis.
                    userSecretKey = cacheResult ? cacheResult[0]?.tokenSecretKey : process.env.JWT_SECRET // If the cache result is not equal to null, store the user secret key. Otherwise, use the system-defined secret key.
                    //The first argument null represents an error. In this case, passing null indicates that no error occurred during the authentication process.
                    // he second argument userSecretKey is the result or the user secret key that is passed to the callback function. It represents the authenticated user's secret key or any relevant information that is needed for further processing
                    return done(null, userSecretKey); // done is a callback function provided by Passport.js that is used to indicate the completion of the authentication process
                } else {
                    return done(null, process.env.JWT_SECRET); //  indicate the completion of the authentication process and provide the resulting user secret key.
                }
            },
        });
    }

    async validate(payload: any) {
        return { ...payload.user };
    }
}