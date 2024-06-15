import { IDecryptWrapper, IUserResponse } from 'src/interface/base.response.interface';
import { FilterFunctions } from 'src/common/functions/array-object-filter.helper';
import { GenericFunctions } from 'src/common/functions/generic-methods.functions';
import { TokenFunctions } from 'src/common/functions/token-generic-function';
import { EMAIL_ENVIRONMENT } from 'src/common/constant/email-cred.constant';
import { REDIS_CACHE_KEY } from 'src/common/constant/redis-key.constant';
import { CacheUserService } from 'src/common/cache/cache-user.service';
import { responseHandler } from 'src/common/helper/response-handler';
import { StatusCodes } from 'src/common/enums/status-codes.enum';
import { Status } from 'src/common/enums/status.enum';
import { Inject, Injectable } from "@nestjs/common";
import { UserEntity } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from '../auth/auth.service';
import { UserMapper } from './mapper/user.mapper';
import { SignUpDto } from './dto/sign-up.dto';
import { HttpService } from '@nestjs/axios';
import { LoginDto } from './dto/login.dto';
import { Repository } from "typeorm";
import { lastValueFrom } from 'rxjs';
import { Request } from 'express';
import 'dotenv/config';


@Injectable()
export class UserRepository {

    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,


        @Inject(UserMapper) private readonly mapper: UserMapper,
        @Inject(AuthService) private readonly authService: AuthService,
        @Inject(FilterFunctions) private readonly filterFunctions: FilterFunctions,
        @Inject(GenericFunctions) private readonly genericFunctions: GenericFunctions,
        @Inject(CacheUserService) private readonly userCacheService: CacheUserService,
        @Inject(TokenFunctions) private readonly tokenFunctionsService: TokenFunctions,

        private readonly httpService: HttpService,
    ) { }

    // ---------------------------------  POST ----------------------------------------


    async signUp(signUpDto: SignUpDto, request: Request): Promise<any> { // Authenticate Or Create user and generate token
        return await this.userSignUp(signUpDto, request);
    }

    async login(loginDto: LoginDto, request: Request): Promise<any> { // Authenticate Or Create user and generate token
        return await this.userLogin(loginDto, request);
    }

    async syncEmail(request: Request): Promise<any> { // Authenticate Or Create user and generate token
        return await this.syncUserEmail(request);
    }

    // ----------------------------- GET --------------------------------------------------------

    async getUserProfile(request: Request): Promise<any> {
        return await this.getRegisterUserProfile(request);
    }

    async redirectMicrosoftToLocal(request: Request, code: string, state: string): Promise<any> {
        return await this.redirectUserMicrosoftToLocalAccount(request, code, state);
    }

    async refreshToken(request: Request, refreshToken: string): Promise<any> {
        return await this.userRefreshToken(request, refreshToken);
    }


    /* ========================================================================================
                                      GET CALLS FUNCTIONS 
     ========================================================================================
*/

    private async redirectUserMicrosoftToLocalAccount(request: Request, code: string, state: string): Promise<IUserResponse> {
        let response: IUserResponse, decryptResponse: IDecryptWrapper;
        try {

            if (!code || !state) return responseHandler(null, "Code or state missing in the response", Status.FAILED, StatusCodes.BAD_REQUEST)

            decryptResponse = this.authService?.decodeJWT(state) as IDecryptWrapper; // decrypting consumer token

            const userId: number = decryptResponse?.id
            const userName: string = decryptResponse?.userName  // Storing the value of consumerId in a variable.
            const email: string = decryptResponse?.email;

            const tokenURL = EMAIL_ENVIRONMENT?.MSAUTH?.TOKEN_URL;
            const clientID = EMAIL_ENVIRONMENT?.MSAUTH?.CLIENT_ID;
            const redirectURI = EMAIL_ENVIRONMENT?.MSAUTH?.REDIRECT_URI;
            const scope = EMAIL_ENVIRONMENT?.MSAUTH?.SCOPE

            const urlResponse = await lastValueFrom(this.httpService.post(
                tokenURL,
                `client_id=${clientID}&scope=${encodeURIComponent(scope)}&code=${code}&redirect_uri=${encodeURIComponent(redirectURI)}&grant_type=authorization_code`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000 // Increase timeout to 10 seconds
            }
            ));

            const accessToken = urlResponse?.data?.access_token;
            const refreshToken = urlResponse?.data.refresh_token;
            const expiresIn = urlResponse?.data.expires_in;
            const extExpiresIn = urlResponse?.data.ext_expires_in;

            await Promise.all([
                this.userRepository.update({ id: userId }, { oAuthEmailToken: accessToken, oAuthEmailRefreshToken: refreshToken, oAuthExpiresIn: expiresIn, oAuthExtExpiresIn: extExpiresIn, emailConnected: true }),
                this.userCacheService.removeConsumerProfileKey(userName),
                this.userCacheService.removeKeyFromRedis(`${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`),
                this.userCacheService.addValueToRedis(
                    `${REDIS_CACHE_KEY?.USER.ADD_USER_ACCESS_REFRESH_TOKEN}_${userId}`,
                    { accessToken: accessToken, refreshToken: refreshToken }
                ),
            ]);

            response = responseHandler(null, `Access Token Generated and saved for future use`, Status.SUCCESS, StatusCodes.SUCCESS) // sending response to client

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return response
    }

    private async userRefreshToken(request: Request, userRefreshToken: string): Promise<IUserResponse> {
        let response: IUserResponse, decryptResponse: IDecryptWrapper;
        try {

            if (!userRefreshToken) return responseHandler(null, "No refresh token found", Status.FAILED, StatusCodes.BAD_REQUEST)
            decryptResponse = this.tokenFunctionsService.decryptUserToken(request); // decrypting consumer token

            const userId: number = decryptResponse?.id
            const userName: string = decryptResponse?.userName  // Storing the value of consumerId in a variable.
            const email: string = decryptResponse?.email;

            const tokenURL = EMAIL_ENVIRONMENT?.MSAUTH?.TOKEN_URL;
            const clientID = EMAIL_ENVIRONMENT?.MSAUTH?.CLIENT_ID;
            const redirectURI = EMAIL_ENVIRONMENT?.MSAUTH?.REDIRECT_URI;
            const grantType = "refresh_token";

            const urlResponse = await lastValueFrom(this.httpService.post(
                tokenURL,
                `client_id=${clientID}&refresh_token=${userRefreshToken}&redirect_uri=${encodeURIComponent(redirectURI)}&grant_type=${grantType}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000 // Increase timeout to 10 seconds
            }
            ));

            const accessToken = urlResponse?.data?.access_token;
            const refreshToken = urlResponse?.data.refresh_token;
            const expiresIn = urlResponse?.data.expires_in;
            const extExpiresIn = urlResponse?.data.ext_expires_in;

            await Promise.all([
                this.userRepository.update({ id: userId }, { oAuthEmailToken: accessToken, oAuthEmailRefreshToken: refreshToken, oAuthExpiresIn: expiresIn, oAuthExtExpiresIn: extExpiresIn }),
                this.userCacheService.removeConsumerProfileKey(userName),
                this.userCacheService.removeKeyFromRedis(`${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`)
            ]);

            response = responseHandler(urlResponse?.data, `User Token is refresh`, Status.SUCCESS, StatusCodes.SUCCESS) // sending response to client

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return response
    }

    private async getRegisterUserProfile(request: Request): Promise<IUserResponse> {
        let response: IUserResponse, decryptResponse: IDecryptWrapper, getUserProfile: UserEntity, result: UserEntity[];

        try {

            decryptResponse = this.tokenFunctionsService.decryptUserToken(request); // decrypting consumer token
            const userName: string = decryptResponse?.userName  // Storing the value of consumerId in a variable.
            const email: string = decryptResponse?.email;

            getUserProfile = await this.userRepository.findOne({
                where: { userName, email },
                cache: {
                    id: `${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`,
                    milliseconds: REDIS_CACHE_KEY?.milliseconds
                }
            });  // fetching result from database 

            if (!getUserProfile) return responseHandler(null, "This User Does not exists", Status.FAILED, StatusCodes.CONFLICT) // Sending an error response if the user already exists.

            result = this.filterFunctions.filterArray([getUserProfile], ['tokenSecretKey', 'oAuthEmailToken', 'passwordHash']);   // Excluding unnecessary keys or applying data filtering to obtain the desired result.

            response = responseHandler(result, `User Profile`, Status.SUCCESS, StatusCodes.SUCCESS) // sending response to client

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }

        return response
    }




    /*   ========================================================================================
                                          POST CALLS FUNCTIONS 
         ========================================================================================
    */

    private async userSignUp(signUpDto: SignUpDto, request: Request): Promise<IUserResponse> {

        let response: IUserResponse, isUserExist: UserEntity, mappedUser: UserEntity, userRegister: UserEntity, dynamicJWTKey: string, unIqueIdentifier: string, hasPassword: string, result: UserEntity[];

        try {
            const userName: string = signUpDto?.userName  // Storing the value of consumerId in a variable.
            const email: string = signUpDto?.email;   // Storing the value of consumerEmail in a variable.
            const userPassword: string = signUpDto?.password; // Storing the value of consumerPassword in a variable.


            unIqueIdentifier = this.tokenFunctionsService.getUniqueIdentifierFromHeader(request)  // Retrieving the device ID from the request headers.

            isUserExist = await this.userRepository.findOne({
                where: { userName, email },
                cache: {
                    id: `${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`,
                    milliseconds: REDIS_CACHE_KEY?.milliseconds
                }
            });

            if (isUserExist?.userName) return responseHandler(null, "This User Name Is Already Exist", Status.FAILED, StatusCodes.CONFLICT) // Sending an error response if the user already exists.
            if (isUserExist?.email) return responseHandler(null, "This Email Is Already Exist", Status.FAILED, StatusCodes.CONFLICT)

            dynamicJWTKey = this.tokenFunctionsService.generateDynamicJwtSecretKey(userName);  // Generating a dynamic secret key for the user based on their consumerId

            hasPassword = await this.authService.hashPassword(userPassword)

            mappedUser = this.mapper.createUserObj(signUpDto, dynamicJWTKey, hasPassword);  // Creating a mapped object for the user
            userRegister = await this.userRepository.save(mappedUser);  //  Persisting the user data in the database.
            await this.userCacheService.removeConsumerProfileKey(mappedUser?.userName)                          // Removing the database cache if it exists for this user.
            await this.userCacheService.removeKeyFromRedis(`${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`)
            result = this.filterFunctions.filterArray([userRegister], ['tokenSecretKey', 'oAuthEmailToken', 'lastLogin', 'passwordHash']);   // Excluding unnecessary keys or applying data filtering to obtain the desired result.

            await this.userCacheService.addConsumerProfile(result[0].id, result, userRegister?.tokenSecretKey, unIqueIdentifier), // Adding this result to the cache.

                response = responseHandler(result, "Sign Up Successfully", Status.SUCCESS, StatusCodes.CREATED)

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }

        return response
    }

    private async userLogin(loginDto: LoginDto, request: Request): Promise<IUserResponse> {

        let response: IUserResponse, isUserExist: UserEntity, generateToken: string, unIqueIdentifier: string, result: UserEntity[], checkPassword: boolean;

        try {
            const email: string = loginDto?.email;   // Storing the value of userEmail in a variable.
            const userPassword: string = loginDto?.password; // Storing the value of userPassword in a variable.
            const userName: string = loginDto?.email.split('@')[0];
            const uniqueIdentifier = this.tokenFunctionsService.getUniqueIdentifierFromHeader(request) // Retrieving the device ID from the request headers.

            unIqueIdentifier = this.tokenFunctionsService.getUniqueIdentifierFromHeader(request)  // Retrieving the device ID from the request headers.

            isUserExist = await this.userRepository.findOne({
                where: { userName, email },
                cache: {
                    id: `${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`,
                    milliseconds: REDIS_CACHE_KEY?.milliseconds
                }
            });

            if (!isUserExist) return response = responseHandler(null, "This Email is not register", Status.FAILED, StatusCodes.NOT_FOUND);
            checkPassword = await this.authService.comparePasswords(userPassword, isUserExist.passwordHash);
            if (!checkPassword) return response = responseHandler(null, "Incorrect Password", Status.FAILED, StatusCodes.BAD_REQUEST);

            generateToken = await this.authService.generateJWTToken(isUserExist, uniqueIdentifier); // Generating a token for the user using their secret key.
            isUserExist.authToken = generateToken
            result = this.filterFunctions.filterArray([isUserExist], ['tokenSecretKey', 'oAuthEmailToken', 'lastLogin', 'passwordHash', 'oAuthEmailRefreshToken']);   // Excluding unnecessary keys or applying data filtering to obtain the desired result.

            await Promise.all([
                this.userRepository.update({ id: isUserExist.id }, { lastLogin: new Date() }),
                this.userCacheService.addConsumerProfile(result[0].id, result, isUserExist?.tokenSecretKey, unIqueIdentifier),
                this.userCacheService.removeKeyFromRedis(`${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`),
                this.userCacheService.addValueToRedis(`${REDIS_CACHE_KEY?.USER.ADD_USER_ACCESS_REFRESH_TOKEN}_${isUserExist.id}`, { accessToken: isUserExist.oAuthEmailToken, refreshToken: isUserExist.oAuthEmailRefreshToken })
            ]);
            response = responseHandler(result, "Login Successfully", Status.SUCCESS, StatusCodes.CREATED)

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }

        return response
    }

    private async syncUserEmail(request: Request): Promise<IUserResponse> {
        let response: IUserResponse, decryptResponse: IDecryptWrapper, getUserProfile: UserEntity, userRefreshToken;
        try {
            decryptResponse = this.tokenFunctionsService.decryptUserToken(request); // decrypting consumer token
            const userId: number = decryptResponse?.id
            const userName: string = decryptResponse?.userName
            const email: string = decryptResponse?.email;

            getUserProfile = await this.userRepository.findOne({
                where: { userName, email },
                cache: {
                    id: `${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`,
                    milliseconds: REDIS_CACHE_KEY?.milliseconds
                }
            });

            let tokenExpirationTime = this.genericFunctions.getTokenExpirationTime(getUserProfile.oAuthExpiresIn);

            const hasExpired = this.genericFunctions.isTokenExpired(tokenExpirationTime)

            if (hasExpired) {
                userRefreshToken = await this.userRefreshToken(request, getUserProfile.oAuthEmailRefreshToken)
                if (userRefreshToken.status === 0) return responseHandler(null, "No access token found try again", Status.FAILED, StatusCodes.BAD_REQUEST)
                getUserProfile.oAuthEmailToken = userRefreshToken.result.access_token;
                getUserProfile.oAuthEmailRefreshToken = userRefreshToken.result.refresh_token;

                await Promise.all([
                    this.userCacheService.addValueToRedis(
                        `${REDIS_CACHE_KEY?.USER.ADD_USER_ACCESS_REFRESH_TOKEN}_${getUserProfile.id}`,
                        { accessToken: getUserProfile.oAuthEmailToken, refreshToken: getUserProfile.oAuthEmailRefreshToken }
                    ),
                    this.userRepository.update(
                        { id: getUserProfile.id },
                        { oAuthEmailToken: getUserProfile.oAuthEmailToken, oAuthEmailRefreshToken: getUserProfile.oAuthEmailRefreshToken }
                    ),
                    this.userCacheService.removeKeyFromRedis(
                        `${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`
                    )
                ]);

            }

            const fetchEmailAPIURL = EMAIL_ENVIRONMENT.MSAUTH.FETCH_EMAIL_API_URL
            const headers = {
                Authorization: `Bearer ${getUserProfile.oAuthEmailToken}`,
            };

            const fetchEmailResponse = await lastValueFrom(this.httpService.get(
                fetchEmailAPIURL,
                {
                    headers
                }
            ));

            response = responseHandler(fetchEmailResponse.data.value, "User Email Sync Successfully", Status.SUCCESS, StatusCodes.CREATED)

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return response
    }

}