import { CreateSubscriptionEmailEvent } from "./events/create-subscription-email.event";
import { TokenFunctions } from "src/common/functions/token-generic-function";
import { REDIS_CACHE_KEY } from "src/common/constant/redis-key.constant";
import { IDecryptWrapper } from "src/interface/base.response.interface";
import { CacheUserService } from "src/common/cache/cache-user.service";
import { ActivityLogEvent } from "./events/activity-log.event";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { EmailSyncEvent } from "./events/sync-email.event";
import { KafkaService } from "../kafka/kafka.service";
import { UserEntity } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Inject, InternalServerErrorException } from "@nestjs/common";
import { Repository } from "typeorm";
import { HttpService } from "@nestjs/axios";
import { resolve } from "path";

@EventsHandler(ActivityLogEvent)
export class ActivityLogEventHandler implements IEventHandler<ActivityLogEvent> {
    constructor(
        // @Inject(TokenFunctions) private readonly tokenService: TokenFunctions,
    ) { }
    handle(event: ActivityLogEvent) {
        try {
            // let decryptResponse: IDecryptWrapper;
            // Handle the event, e.g., send a notification to the user or use it for activity
            // decryptResponse = this.tokenService.decryptUserToken(event.request); // decrypting consumer token
            // event.logMapper.consumerId = JSON.stringify(decryptResponse?.consumerId ?? '')
            console.log(event.logMapper, '==========event.logMapper===============');

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}


@EventsHandler(CreateSubscriptionEmailEvent)
export class CreateSubscriptionEmailEventHandler implements IEventHandler<CreateSubscriptionEmailEvent> {
    constructor(
        private readonly httpService: HttpService,

    ) { }
    async handle(event: CreateSubscriptionEmailEvent) {
        try {
            const authorizationHeader: string = event?.request?.headers['authorization']

            const headers = {
                "Authorization": authorizationHeader,
                "deviceId": event.request.headers.deviceid
            }

            this.httpService.axiosRef.post(`http://host.docker.internal:3001/api/email/subscription?status=created`, {}, { headers }).then(res => { resolve("true") }).catch(error => {
                resolve("error")
            });
            this.httpService.axiosRef.post(`http://host.docker.internal:3001/api/email/subscription?status=updated`, {}, { headers }).then(res => { resolve("true") }).catch(error => {
                resolve("error")
            });

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}

@EventsHandler(EmailSyncEvent)
export class EmailSyncEventHandler implements IEventHandler<EmailSyncEvent> {
    constructor(
        private kafkaService: KafkaService,
        @Inject(TokenFunctions) private readonly tokenService: TokenFunctions,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @Inject(CacheUserService) private readonly userCacheService: CacheUserService,

    ) { }
    async handle(event: EmailSyncEvent) {
        try {
            let decryptResponse: IDecryptWrapper;
            decryptResponse = this.tokenService.decryptUserToken(event.request);

            const userId: number = decryptResponse?.id
            const userName: string = decryptResponse?.userName  // Storing the value of consumerId in a variable.
            const email: string = decryptResponse?.email;

            const header = {
                'userId': `${userId}`,
                'userName': `${userName}`,
                'email': `${email}`,
                'isLastItemInArray': 'false'
            }

            for (let i = 0; i < event?.emailData?.length; i++) {
                let element = event?.emailData[i];

                if (i === event?.emailData?.length - 1) {
                    header['isLastItemInArray'] = 'true'
                }
                await this.kafkaService.sendMessage(process.env.KAFKA_TOPIC_SYNC_EMAIL, element, header);
            }
            await this.userRepository.update({ id: userId }, { emailConnected: true, isEmailSync: true })
            await this.userCacheService.removeKeyFromRedis(`${REDIS_CACHE_KEY?.USER.GET_USER_BY_EMAIL_AND_USERNAME}-${userName}-${email}`)

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}

