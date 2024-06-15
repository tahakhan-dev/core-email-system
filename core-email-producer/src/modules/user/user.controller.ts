import { Controller, Get, Post, Body, Res, Req, Inject, UseGuards, Query, Render } from '@nestjs/common';
import { IUserResponse, IResponseWrapper } from 'src/interface/base.response.interface';
import { GenericFunctions } from 'src/common/functions/generic-methods.functions';
import { EMAIL_ENVIRONMENT } from 'src/common/constant/email-cred.constant';
import { TokenFunctions } from 'src/common/functions/token-generic-function';
import { StatusCodes } from 'src/common/enums/status-codes.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { Status } from 'src/common/enums/status.enum';
import { UserEntity } from './entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { UserService } from './user.service';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';


@Controller({ path: 'user' })
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(GenericFunctions) private readonly genericFunctions: GenericFunctions,
    @Inject(TokenFunctions) private readonly tokenFunctionsService: TokenFunctions,
  ) { }


  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })// Throttling limits the number of requests that a client can make within a certain time period
  @Post('/signUp')
  async singUp(@Res() res: Response, @Req() request: Request, @Body() signUpDto: SignUpDto): Promise<IUserResponse> {  // interface defines the structure of the response object that the method will return, which includes properties such as StatusCode, Result, and Message
    try {
      const signUp = await this.userService.signUpServiceHandler(signUpDto, request);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [signUp.message])
      res.status(Number(signUp.statusCode)).json(signUp);
    } catch (error) {
      const response: IResponseWrapper<UserEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }

  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })
  @Post('/login')
  async login(@Res() res: Response, @Req() request: Request, @Body() loginDto: LoginDto): Promise<IUserResponse> {
    try {
      const login = await this.userService.loginServiceHandler(loginDto, request);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [login.message])
      res.status(Number(login.statusCode)).json(login);
    } catch (error) {
      const response: IResponseWrapper<UserEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }

  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })
  @UseGuards(JwtAuthGuard)
  @Post('/outlook/syncEmail')
  async syncEmail(@Res() res: Response, @Req() request: Request): Promise<IUserResponse> {
    try {
      const syncEmail = await this.userService.syncEmailServiceHandler(request);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [syncEmail.message])
      res.status(Number(syncEmail.statusCode)).json(syncEmail);
    } catch (error) {
      const response: IResponseWrapper<UserEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }

  // ==================== GET ROUTES ====================

  // @UseGuards(DisableRouteGuard)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })
  @Get('/getUserProfile')
  async getUserProfile(@Res() res: Response, @Req() request: Request): Promise<IUserResponse> {

    try {
      const getUserProfile = await this.userService.getUserProfileServiceHandler(request);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [getUserProfile.message])
      res.status(Number(getUserProfile.statusCode)).json(getUserProfile);
    } catch (error) {
      const response: IResponseWrapper<UserEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }

  @UseGuards(JwtAuthGuard)
  // @Version(false)
  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })
  @Get('/redirectToMicrosoft')
  redirectToMicrosof(@Res() res: Response, @Req() request: Request) {
    let consumerToken: string | boolean = this.tokenFunctionsService.getUserToken(request); // decrypting consumer token

    const authUrl = `${EMAIL_ENVIRONMENT.MSAUTH.AUTHORIZATION_URL}?client_id=${EMAIL_ENVIRONMENT.MSAUTH.CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(EMAIL_ENVIRONMENT.MSAUTH.REDIRECT_URI)}&response_mode=query&scope=${encodeURIComponent(EMAIL_ENVIRONMENT.MSAUTH.SCOPE)}&state=${consumerToken}`;
    res.send(authUrl);
  }

  @Get('/outlook/redirect')
  @Render('outlook-login-success')
  async handleRedirect(@Res() res: Response, @Req() request: Request, @Query('code') code: string, @Query('state') state: string): Promise<IUserResponse> {

    try {
      const redirectMicrosoftToLocal = await this.userService.redirectMicrosoftToLocalServiceHandler(request, code, state);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [redirectMicrosoftToLocal.message])
      // res.status(Number(redirectMicrosoftToLocal.statusCode)).json(redirectMicrosoftToLocal);

    } catch (error) {
      const response: IResponseWrapper<UserEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }


  @Get('/outlook/refreshToken')
  async handleRefreshToken(@Res() res: Response, @Req() request: Request, @Query('refresh_token') refreshToken: string): Promise<IUserResponse> {

    try {
      const userRefreshToken = await this.userService.userRefreshTokenServiceHandler(request, refreshToken);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [userRefreshToken.message])
      res.status(Number(userRefreshToken.statusCode)).json(userRefreshToken);

    } catch (error) {
      const response: IResponseWrapper<UserEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }


}
