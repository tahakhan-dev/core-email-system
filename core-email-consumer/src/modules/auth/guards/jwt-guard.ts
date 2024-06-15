import { ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { IDecryptWrapper } from '../../../interface/base.response.interface';
import { CacheEmailService } from "src/common/cache/cache-email.service";
import { AuthService } from '../auth.service';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { // AuthGuard class is a built-in class provided by NestJS that acts as a base class for creating custom authentication guards.
    constructor(
        @Inject(AuthService) private readonly authService: AuthService, // An instance of the AuthService class, which is responsible for handling authentication-related tasks
        @Inject(CacheEmailService) private readonly cacheEmailService: CacheEmailService // An instance of the CacheUserService class, which provides caching functionality related to user data
    ) {
        super(); // The super() statement is called within the constructor to invoke the constructor of the base class (AuthGuard) and ensure proper initialization of the parent class
    }

    async canActivate(context: ExecutionContext): Promise<any> { // it is responsible for determining whether a user is authorized to access a specific route or resource
        // Add your custom validation logic here

        const request = context?.switchToHttp()?.getRequest(); // the code extracts and stores the HTTP request object in the request variable, allowing you to access and manipulate various properties and data associated with the request.
        const userToken: string = request?.headers?.authorization?.split(' ')[1]; // Extracting the authorization header from the request and splitting the bearer keyword from the token to obtain the full token
        const userUniqueIdentifier: string = request?.headers?.deviceid // Extracting device Id

        const tokenDetail: IDecryptWrapper = this.authService?.decodeJWT(userToken) as IDecryptWrapper

        const checkingValidation: boolean = await this.cacheEmailService?.checkUniqueIdentifierAndTokenIssueFromSameUser(userUniqueIdentifier, tokenDetail?.id, userToken) // Checking if the token is generated from the same device. If it is generated from a different device, throw an error indicating that the user needs to register their device by signing in with that device first

        if (!checkingValidation) { // If the validation result is false, throw the following error message.
            throw new UnauthorizedException("Your Device Is Not Register Please try signIn again In Order To Register Your Device");
        }
        if (!userToken || !userUniqueIdentifier) { // if the consumerToken or deviceId is missing, throw an error indicating the missing field(s)
            throw new UnauthorizedException(!userToken ? 'Missing JWT token' : 'missing deviceId');
        }

        try {
            if (tokenDetail.iss !== userUniqueIdentifier) { // If the issuer user is not the same, throw an error indicating that the token has been breached by someone else.
                throw new UnauthorizedException('you are using someone else token please try again');
            }
            return super.canActivate(context);
        } catch (error) {
            throw new UnauthorizedException('you are using someone else token please try again');
        }
    }
}