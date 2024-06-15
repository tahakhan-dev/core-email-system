import { ActivityLogEventHandler, CreateEmailSubscriptionCronEventtHandler, CreateEmailSubscriptionEventHandler, NotifyUserMutateEmailEventtHandler, UpdateEmailSubscriptionEventHandler } from './event.handler';
import { CreateEmailCommandHandler, CreateSubscriptionsCronCommandHandler, DeleteEmailCommandHandler, EmailSubscriptionCommandHandler, UpdateEmailCommandHandler } from './command.handler';
import { GetAllUserEmailQueryHandler, GetUserEmailByIdQueryHandler } from './query.handler';
import { InterServicesModule } from 'src/common/inter-services/inter-service.module';
import { GenericFunctions } from 'src/common/functions/generic-methods.functions';
import { EmailSubscription } from 'src/common/helper/email-subscription.helper';
import { TokenFunctions } from 'src/common/functions/token-generic-function';
import { CacheEmailService } from 'src/common/cache/cache-email.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SyncDataMapper } from './mapper/syncData.mapper';
import { EmailEntity } from './entities/email.entity';
import { EmailRepository } from './email.repository';
import { EmailController } from './email.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    InterServicesModule,
    ScheduleModule.forRoot(),

    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 10000,
        maxRedirects: 15,
      }),
    }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        signOptions: { expiresIn: '3d' }
      })
    }),
    TypeOrmModule.forFeature([
      EmailEntity
    ]),
    ClientsModule.register([
      {
        name: process.env.KAFKA_NAME,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER_IP],
          },
          producerOnlyMode: true,
          consumer: {
            groupId: process.env.KAFKA_GROUP_ID,
          },
        },
      },
    ])
  ],
  controllers: [EmailController],
  providers: [
    // services and helpers
    EmailService,
    SyncDataMapper,
    TokenFunctions,
    GenericFunctions,
    CacheEmailService,
    EmailSubscription,
    // event handler
    ActivityLogEventHandler,
    NotifyUserMutateEmailEventtHandler,
    CreateEmailSubscriptionEventHandler,
    UpdateEmailSubscriptionEventHandler,
    CreateEmailSubscriptionCronEventtHandler,
    // query handler
    GetAllUserEmailQueryHandler,
    GetUserEmailByIdQueryHandler,
    // command handler
    CreateEmailCommandHandler,
    UpdateEmailCommandHandler,
    DeleteEmailCommandHandler,
    EmailSubscriptionCommandHandler,
    CreateSubscriptionsCronCommandHandler,
    // reporsitory
    EmailRepository,

  ],
})
export class EmailModule { }
