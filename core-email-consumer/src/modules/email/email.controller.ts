import { Controller, Get, Post, Body, Res, Req, Inject, Query, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { IEmailResponse, IResponseWrapper } from 'src/interface/base.response.interface';
import { GenericFunctions } from 'src/common/functions/generic-methods.functions';
import { Ctx, KafkaContext, MessagePattern } from '@nestjs/microservices';
import { Status, SubscriptionStatus } from 'src/common/enums/status.enum';
import { StatusCodes } from 'src/common/enums/status-codes.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { EmailEntity } from './entities/email.entity';
import { EmailService } from './email.service';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';

@Controller({ path: 'email' })
export class EmailController {
  constructor(
    @Inject(GenericFunctions) private readonly genericFunctions: GenericFunctions,
    private readonly emailService: EmailService
  ) { }

  //  ================  KAFKA CONSUMER =======================================

  @MessagePattern(process.env.KAFKA_TOPIC_SYNC_EMAIL) // Kafka topic
  async consumeUserEmailData(@Ctx() context: KafkaContext) {

    try {
      const kafkaMessage = context.getMessage();
      const bufferValue = kafkaMessage.value;
      const headerValue = kafkaMessage.headers
      await this.emailService.syncEmailToDatabaseServiceHandler(bufferValue, headerValue);

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  @MessagePattern(process.env.KAFKA_UPDATE_EMAIL_SUBSCRIPTION_TOPIC)
  async consumeUpdatemails(@Ctx() context: KafkaContext) {

    try {
      const kafkaMessage = context.getMessage();
      const bufferValue = kafkaMessage.value;
      await this.emailService.consumeUpdateEmailServiceHandler(bufferValue);

    } catch (error) {
      console.log(error);
      // throw new InternalServerErrorException(error)
    }
  }

  @MessagePattern(process.env.KAFKA_CREATE_EMAIL_SUBSCRIPTION_TOPIC)
  async consumeNewEmails(@Ctx() context: KafkaContext) {

    try {
      const kafkaMessage = context.getMessage();
      const bufferValue = kafkaMessage.value;
      await this.emailService.consumeNewEmailServiceHandler(bufferValue);

    } catch (error) {
      console.log(error);
      // throw new InternalServerErrorException(error)
    }
  }

  @MessagePattern(process.env.KAFKA_EMAIL_SUBSCRIPTION_TOPIC)
  async createEmailSubscriptionsCron(@Ctx() context: KafkaContext) {

    try {
      const kafkaMessage = context.getMessage();
      const bufferValue = kafkaMessage.value;
      await this.emailService.recreateUserEmailSubscriptionCron(bufferValue);

    } catch (error) {
      console.log(error);
      // throw new InternalServerErrorException(error)
    }
  }

  // ============================= POST REQUEST ============================================

  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })
  @UseGuards(JwtAuthGuard)
  @Post('/subscription')
  async createEmailSubscription(@Res() res: Response, @Req() request: Request, @Query('status') status: SubscriptionStatus,): Promise<IEmailResponse> {
    try {
      const emailSubscription = await this.emailService.emailSubscriptionServiceHandler(request, status);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [emailSubscription.message])
      res.status(Number(emailSubscription.statusCode)).json(emailSubscription);
    } catch (error) {
      const response: IResponseWrapper<EmailEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }


  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })
  @Post('/created')
  async createEmail(@Res() res: Response, @Req() request: Request, @Body() createEmailBody: any,): Promise<IEmailResponse> {
    try {
      // Check if this is a validation request
      const validationToken = request.query.validationToken;
      if (validationToken) {
        // Respond with the validation token
        res.status(200).send(validationToken);
        return;
      }

      const createEmail = await this.emailService.createEmailServiceHandler(request, createEmailBody);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [createEmail.message])
      res.status(Number(createEmail.statusCode)).json(createEmail);
    } catch (error) {
      const response: IResponseWrapper<EmailEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }

  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })
  @Post('/updated')
  async updateEmail(@Res() res: Response, @Req() request: Request, @Body() updateEmailBody: any,): Promise<IEmailResponse> {
    try {

      const validationToken = request.query.validationToken;
      if (validationToken) {
        // Respond with the validation token
        res.status(200).send(validationToken);
        return;
      }
      const updateEmail = await this.emailService.updateEmailServiceHandler(request, updateEmailBody);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [updateEmail.message])
      res.status(Number(updateEmail.statusCode)).json(updateEmail);
    } catch (error) {
      const response: IResponseWrapper<EmailEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }

  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })
  @Post('/deleted')
  async deleteEmail(@Res() res: Response, @Req() request: Request, @Body() deleteEmailBody: any,): Promise<IEmailResponse> {
    try {
      const deleteEmail = await this.emailService.deleteEmailServiceHandler(request, deleteEmailBody);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [deleteEmail.message])
      res.status(Number(deleteEmail.statusCode)).json(deleteEmail);
    } catch (error) {
      const response: IResponseWrapper<EmailEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }


  // ============================== GET REQUEST ============================================

  @Throttle({ default: { limit: +process.env.THROTTLER_USER_LIMIT, ttl: +process.env.THROTTLER_USER_TTL } })
  @UseGuards(JwtAuthGuard)
  @Get('/getAllUserEmail')
  async getAllUserEmail(@Res() res: Response, @Req() request: Request): Promise<IEmailResponse> {

    try {
      const getAllUserEmail = await this.emailService.getAllUserEmailServiceHandler(request);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [getAllUserEmail.message])
      res.status(Number(getAllUserEmail.statusCode)).json(getAllUserEmail);
    } catch (error) {
      const response: IResponseWrapper<EmailEntity[]> = {
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
  @Get('/getUserEmailById')
  async getUserEmailById(@Res() res: Response, @Req() request: Request, @Query('emailId') emailId: string): Promise<IEmailResponse> {

    try {
      const getUserEmailById = await this.emailService.getUserEmailByIdServiceHandler(request, +emailId);
      this.genericFunctions.settingResponseHeader(res, ['activity_message'], [getUserEmailById.message])
      res.status(Number(getUserEmailById.statusCode)).json(getUserEmailById);
    } catch (error) {
      const response: IResponseWrapper<EmailEntity[]> = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: Status.FAILED,
        result: null,
        message: error.message,
      };
      return response;
    }
  }

}
