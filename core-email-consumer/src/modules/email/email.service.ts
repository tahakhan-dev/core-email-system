import { CreateSubscriptionsCronCommand } from './command/create-subscriptions-cron.command';
import { NotifyUserMutateEmailEvent } from './events/notifiy-user-mutate-email.event';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { EmailSubscriptionCommand } from './command/email-subscription.command';
import { EmailSubscription } from 'src/common/helper/email-subscription.helper';
import { GetUserEmailByIdQuery } from './query/get-user-email-by-id.query';
import { CacheEmailService } from 'src/common/cache/cache-email.service';
import { REDIS_CACHE_KEY } from 'src/common/constant/redis-key.constant';
import { GetAllUserEmailQuery } from './query/get-all-user-email.query';
import { IEmailResponse } from 'src/interface/base.response.interface';
import { CreateEmailCommand } from './command/create-email.command';
import { DeleteEmailCommand } from './command/delete-email.command';
import { UpdateEmailCommand } from './command/update-email.command';
import { SubscriptionStatus } from 'src/common/enums/status.enum';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { SyncDataMapper } from './mapper/syncData.mapper';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailEntity } from './entities/email.entity';
import { EmailRepository } from './email.repository';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import 'dotenv/config';

@Injectable()
export class EmailService {

  constructor(
    @InjectRepository(EmailEntity) private readonly emailRepositoryEntity: Repository<EmailEntity>,
    @Inject(SyncDataMapper) private readonly syncDataMapper: SyncDataMapper,
    @Inject(process.env.KAFKA_NAME) private readonly kafkaClient: ClientKafka,
    @Inject(EmailSubscription) private readonly emailSubscriptionService: EmailSubscription,
    @Inject(CacheEmailService) private readonly cacheEmailService: CacheEmailService,
    @Inject(EmailRepository) private readonly emailRepository: EmailRepository,

    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,


  ) { }

  // ========================== KAFKA CONSUMER SERVICES ==============================
  async syncEmailToDatabaseServiceHandler(value: Buffer, headerValue: any) {
    try {
      const mapper = this.syncDataMapper.syncEmailDataObj(value, headerValue);

      if (headerValue?.isLastItemInArray === 'true') {

        this.kafkaClient.emit(process.env.KAFKA_SYNC_EMAIL_ACK_TOPIC, JSON.stringify({
          userId: headerValue?.userId,
          userName: headerValue?.userName,
          email: headerValue?.email,
          lastDataInserted: true
        }))
        this.kafkaClient.emit(process.env.KAFKA_EMAIL_SUBSCRIPTION_TOPIC, JSON.stringify({ userId: headerValue?.userId }))
      }
      await Promise.all([
        this.emailRepositoryEntity.save(mapper),
        this.cacheEmailService.removeKeyFromRedis(`${REDIS_CACHE_KEY?.EMAIL.GET_USER_EMAIL_BY_ID}_${headerValue?.userId}`)
      ])
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async consumeNewEmailServiceHandler(value: any) {
    try {
      const accessToken = value.accessToken;
      const emailId = value?.emailId
      const userId = value?.userId

      let getUserEmailById = await this.emailSubscriptionService.getNewEmailBySubscription(emailId, accessToken);
      let getUserEmailByEmailId = await this.emailRepositoryEntity.findOne({ where: { emailId } });

      if (!getUserEmailByEmailId) {
        const mapper = this.syncDataMapper.syncEmailDataObj(getUserEmailById, { email: getUserEmailById?.toRecipients[0]?.emailAddress.address, userId, userName: "null" });

        await Promise.all([
          this.emailRepositoryEntity.save(mapper),
          this.cacheEmailService.removeKeyFromRedis(`${REDIS_CACHE_KEY?.EMAIL.GET_USER_EMAIL_BY_ID}_${userId}`)
        ])

        const notifyUserMutateEmailEvent = new NotifyUserMutateEmailEvent(userId);
        const allEvent = [notifyUserMutateEmailEvent];
        this.eventBus.publishAll(allEvent)
      }

    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async consumeUpdateEmailServiceHandler(value: any) {
    try {
      const accessToken = value.accessToken;
      const emailId = value?.emailId
      const userId = value?.userId

      let mapper

      let getUserEmailById = await this.emailSubscriptionService.getNewEmailBySubscription(emailId, accessToken);

      mapper = this.syncDataMapper.syncEmailDataObj(getUserEmailById, { email: getUserEmailById?.toRecipients[0]?.emailAddress.address, userId: userId });

      await Promise.all([
        this.emailRepositoryEntity.update({ emailId }, mapper),
        this.cacheEmailService.removeKeyFromRedis(`${REDIS_CACHE_KEY?.EMAIL.GET_USER_EMAIL_BY_ID}_${userId}`)
      ]);

      const notifyUserMutateEmailEvent = new NotifyUserMutateEmailEvent(userId);
      const allEvent = [notifyUserMutateEmailEvent];
      this.eventBus.publishAll(allEvent)

    } catch (error) {
      console.log(error.response.error.code, '======error==========');
      throw new InternalServerErrorException(error)
    }
  }

  async recreateUserEmailSubscriptionCron(value: any) {
    try {

      await Promise.all([
        this.emailRepository.emailSubscription(undefined, SubscriptionStatus.CREATED, value?.userId),
        this.emailRepository.emailSubscription(undefined, SubscriptionStatus.UPDATED, value?.userId)
      ]);
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  //  ============================= SCHEDULER  ============================================

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCron() {
    await this.commandBus.execute(
      new CreateSubscriptionsCronCommand()
    )
  }


  // =================    POST REQUEST SERVICE HANDLER    =============================


  async emailSubscriptionServiceHandler(request: Request, status: SubscriptionStatus): Promise<IEmailResponse> {
    try {
      return await this.commandBus.execute(
        new EmailSubscriptionCommand(request, status)
      )
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
  async createEmailServiceHandler(request: Request, createEmailBody: any): Promise<IEmailResponse> {
    try {
      return await this.commandBus.execute(
        new CreateEmailCommand(request, createEmailBody)
      )
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async updateEmailServiceHandler(request: Request, updateEmailBody: any): Promise<IEmailResponse> {
    try {
      return await this.commandBus.execute(
        new UpdateEmailCommand(request, updateEmailBody)
      )
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async deleteEmailServiceHandler(request: Request, deleteEmailBody: any): Promise<IEmailResponse> {
    try {
      return await this.commandBus.execute(
        new DeleteEmailCommand(request, deleteEmailBody)
      )
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  // =================    GET REQUEST SERVICE HANDLER    =============================

  async getAllUserEmailServiceHandler(request: Request): Promise<IEmailResponse> {
    try {
      return await this.queryBus.execute(
        new GetAllUserEmailQuery(request),
      );
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  async getUserEmailByIdServiceHandler(request: Request, id: number): Promise<IEmailResponse> {
    try {
      return await this.queryBus.execute(
        new GetUserEmailByIdQuery(request, id),
      );
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }
}
