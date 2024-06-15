import { Injectable, OnModuleInit, OnModuleDestroy, Inject, InternalServerErrorException } from '@nestjs/common';
import { CacheUserService } from 'src/common/cache/cache-user.service';
import { AppGateway } from '../../common/helper/app.gateway';
import { Producer, Kafka, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private kafka: Kafka;
    private producer: Producer;
    private consumer1: Consumer;
    private consumer2: Consumer;

    constructor(
        private appGateway: AppGateway,
        @Inject(CacheUserService) private readonly userCacheService: CacheUserService,
    ) {
        this.kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER_IP], // Specify your Kafka broker addresses
        });

        this.producer = this.kafka.producer();
        this.consumer1 = this.kafka.consumer({ groupId: process.env.KAFKA_CONSUMER_1_GROUP_ID });
        this.consumer2 = this.kafka.consumer({ groupId: process.env.KAFKA_CONSUMER_2_GROUP_ID });
    }

    async onModuleInit() {
        try {
            await this.producer.connect();
            await this.consumer1.connect();
            await this.consumer2.connect();

            await this.consumer1.subscribe({ topic: process.env.KAFKA_TOPIC_CONSUMER_1 });
            this.consumer1.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const ackData = JSON.parse(message.value.toString())

                    if (ackData?.lastDataInserted) {
                        let getWebSocketClientData = await this.userCacheService.getWebSocketClientData(+ackData?.userId);
                        // this.appGateway.sendSynckAcknowledgementToClient(getWebSocketClientData?.clientId, ackData);
                        this.appGateway.sendSynckAcknowledgementToAll(ackData)
                    }
                },
            });

            await this.consumer2.subscribe({ topic: process.env.KAFKA_TOPIC_CONSUMER_2 });
            this.consumer2.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const ackData = JSON.parse(message.value.toString())

                    if (ackData?.userId) {
                        let getWebSocketClientData = await this.userCacheService.getWebSocketClientData(+ackData?.userId);
                        if (getWebSocketClientData) {
                            this.appGateway.sendSynckAcknowledgementToAllForMutateEmail({ userId: ackData?.userId, message: "email mutated fetch email" });
                        }
                    }
                },
            });
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async onModuleDestroy() {
        try {
            await this.producer.disconnect();
            await this.consumer1.disconnect();
            await this.consumer2.disconnect();
        } catch (error) {
            console.log(error);
        }
    }

    async sendMessage(topic: string, message: any, headers: Record<string, string>) {
        try {
            const result = await this.producer.send({
                topic,
                messages: [
                    {
                        value: JSON.stringify(message),
                        headers: headers // Including headers in the message
                    }],
            });
            return result;
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}
