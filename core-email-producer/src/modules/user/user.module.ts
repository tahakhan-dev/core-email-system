import { GetUserProfileQueryHandler, RedirectMicrosoftToLocalQueryHandler, UserRefreshTokenQueryHandler } from './query.handler';
import { ActivityLogEventHandler, CreateSubscriptionEmailEventHandler, EmailSyncEventHandler } from './event.handler';
import { LoginCommandHandler, SignUpCommandHandler, SyncEmailCommandHandler } from './command.handler';
import { FilterFunctions } from 'src/common/functions/array-object-filter.helper';
import { GenericFunctions } from 'src/common/functions/generic-methods.functions';
import { TokenFunctions } from 'src/common/functions/token-generic-function';
import { CacheUserService } from 'src/common/cache/cache-user.service';
import { KafkaModule } from '../kafka/kafka.module';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { UserMapper } from './mapper/user.mapper';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 15000,
        maxRedirects: 5,
      }),
    }),
    TypeOrmModule.forFeature([ //  It is used to configure which entities should be registered and made available for dependency injection within a specific module
      UserEntity
    ]),
    CqrsModule,
    AuthModule,
    KafkaModule
  ],
  controllers: [UserController],
  providers: [
    SignUpCommandHandler,
    LoginCommandHandler,
    SyncEmailCommandHandler,
    GetUserProfileQueryHandler,
    RedirectMicrosoftToLocalQueryHandler,
    CreateSubscriptionEmailEventHandler,
    UserRefreshTokenQueryHandler,
    UserRepository,

    UserService,
    ActivityLogEventHandler,
    EmailSyncEventHandler,
    TokenFunctions,
    UserMapper,
    GenericFunctions,
    CacheUserService,
    FilterFunctions,
  ],
})
export class UserModule { }
