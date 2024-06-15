import { RedirectMicrosoftToLocalQuery } from "./query/redirect-microsoft-to-local.query";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserRefreshTokenQuery } from "./query/user-refresh-token.query";
import { IUserResponse } from "src/interface/base.response.interface";
import { GetUserProfileQuery } from "./query/get-user-profile.query";
import { SyncEmailCommand } from "./command/sync-email.command";
import { SignUpCommand } from "./command/sign-up.command";
import { LoginCommand } from "./command/login.command";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { SignUpDto } from "./dto/sign-up.dto";
import { LoginDto } from "./dto/login.dto";
import { Request } from 'express';
@Injectable()
export class UserService {

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  async signUpServiceHandler(signUpDto: SignUpDto, request: Request): Promise<IUserResponse> {
    try {
      return await this.commandBus.execute(
        new SignUpCommand(signUpDto, request)
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  async loginServiceHandler(loginDto: LoginDto, request: Request): Promise<IUserResponse> {
    try {
      return await this.commandBus.execute(
        new LoginCommand(loginDto, request)
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  async syncEmailServiceHandler(request: Request): Promise<IUserResponse> {
    try {
      return await this.commandBus.execute(
        new SyncEmailCommand(request)
      )
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }


  /* ========================================================================================
                                    GET SERVICES 
   ========================================================================================
*/

  async getUserProfileServiceHandler(request: Request): Promise<IUserResponse> {
    try {
      return await this.queryBus.execute(
        new GetUserProfileQuery(request),
      );
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  async redirectMicrosoftToLocalServiceHandler(request: Request, code: string, state: string): Promise<IUserResponse> {
    try {
      return await this.queryBus.execute(
        new RedirectMicrosoftToLocalQuery(request, code, state),
      );
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

  async userRefreshTokenServiceHandler(request: Request, refreshToken: string): Promise<IUserResponse> {
    try {
      return await this.queryBus.execute(
        new UserRefreshTokenQuery(request, refreshToken),
      );
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }

}
