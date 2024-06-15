import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IDeviceToken } from 'src/interface/base.response.interface';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { REDIS_CACHE_KEY } from '../constant/redis-key.constant';
import { InjectCluster } from '@liaoliaots/nestjs-redis';
import { Cluster } from 'ioredis';
import 'dotenv/config';


@Injectable()
export class CacheUserService {
    constructor(
        @InjectCluster() private readonly cluster: Cluster,
    ) { }

    async removeConsumerProfileKey(userName: string) {
        try {
            const deletePromise = [
                this.cluster.del(`${REDIS_CACHE_KEY?.USER.FETCH_USER_PROFILE_DB_CACHE_KEY_PREFIX}_${userName}`),
                this.cluster.del(`${REDIS_CACHE_KEY?.USER.GET_USER_PROFILE_DB_CACHE_KEY_PREFIX}_${userName}`)
            ]
            await Promise.all(deletePromise)
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
    async removeKeyFromRedis(key: string) {
        try {
            await this.cluster.del(key)
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async addValueToRedis(key: string, value: any) {
        try {
            await this.cluster.set(key, JSON.stringify(value))
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async addConsumerProfile(userId: number, data: UserEntity[], secret_key: string, userUniqueIdentifier: string) {
        try {
            let DeviceTokenArray: IDeviceToken[] = [], arrayofObject: UserEntity[], getProfileObject: UserEntity[]

            arrayofObject = JSON.parse(JSON.stringify(data)); // JSON.stringify(data) is used to serialize the data array to a JSON string, and then JSON.parse() is used to deserialize the JSON string back into a new array, effectively creating a deep copy.
            getProfileObject = JSON.parse(await this.cluster.get(`${REDIS_CACHE_KEY?.USER.ADD_CONSUMER_PROFILE_KEY_PREFIX}_${userId}`)); // getting consumerProfile from redis

            if (getProfileObject) { // If the Redis cache value is not equal to null, perform the specified task. Otherwise, execute the corresponding actions in the else condition.
                const isDeviceTokenExist: number = getProfileObject[0]?.devicesToken?.findIndex(tokenObj => tokenObj?.UniqueIdentifier === userUniqueIdentifier); // checking if device id exist or not 

                if (isDeviceTokenExist !== -1) { // if device id does not exist then remove it from DevicesToken token
                    getProfileObject[0]?.devicesToken?.splice(isDeviceTokenExist, 1); // Remove the object at the found index
                }

                getProfileObject[0]?.devicesToken?.forEach(deviceResponse => {
                    DeviceTokenArray.push(deviceResponse) // After removing the device ID, push the remaining device IDs to another array called "DeviceTokenArray."
                });

                DeviceTokenArray.push({ UniqueIdentifier: userUniqueIdentifier, authToken: arrayofObject[0]?.authToken }) // now push new Device Id to this array
                arrayofObject[0].devicesToken = DeviceTokenArray // Initializing the "DeviceTokenArray" into the "devicesToken" array.
            } else {
                arrayofObject[0].devicesToken = [{ UniqueIdentifier: userUniqueIdentifier, authToken: arrayofObject[0]?.authToken }]
            }

            arrayofObject[0].tokenSecretKey = secret_key;
            arrayofObject[0].authToken = ''

            await this.cluster.set(`${REDIS_CACHE_KEY?.USER.ADD_CONSUMER_PROFILE_KEY_PREFIX}_${userId}`, JSON.stringify(arrayofObject), "EX", process?.env?.CACHE_TTL);
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async getUserProfileRedis(userId: number) {
        try {
            return await this.cluster.get(`${REDIS_CACHE_KEY?.USER.ADD_CONSUMER_PROFILE_KEY_PREFIX}_${userId}`);
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async checkUniqueIdentifierAndTokenIssueFromSameUser(userUniqueIdentifier: string, userId: number): Promise<boolean> {
        try {
            let getProfileObject: UserEntity[];

            getProfileObject = JSON.parse(await this.cluster.get(`${REDIS_CACHE_KEY?.USER.ADD_CONSUMER_PROFILE_KEY_PREFIX}_${userId}`));

            if (!getProfileObject) return false

            const isDeviceTokenExist: IDeviceToken = getProfileObject[0]?.devicesToken?.find(tokenObj => tokenObj?.UniqueIdentifier === userUniqueIdentifier);

            if (!isDeviceTokenExist) return false
            if (isDeviceTokenExist?.authToken.length === 0) return false
            if (isDeviceTokenExist?.authToken == null || undefined) return false
            if (isDeviceTokenExist?.UniqueIdentifier !== userUniqueIdentifier) return false
            return true

        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    async handleWebSocketClientData(userId: number, clientId: string): Promise<void> {
        try {
            const key = REDIS_CACHE_KEY?.USER?.WEB_SOCKET_CLIENT_KEY_PREFIX; // Redis key where data is stored
            let clientData = JSON.parse(await this.cluster.get(key))

            if (!clientData) {
                clientData = [];
            }

            const index = clientData?.findIndex(item => item?.userId === userId);

            if (index === -1) {
                // ID not found, push new object
                clientData.push({ userId, clientId });
            } else {
                // ID found, update clientId
                clientData[index].clientId = clientId;
            }

            await this.cluster.set(key, JSON.stringify(clientData));
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async handleWebSocketRemoveClientData(clientId: string): Promise<void> {
        try {
            const key = REDIS_CACHE_KEY?.USER?.WEB_SOCKET_CLIENT_KEY_PREFIX; // Redis key where data is stored
            let clientData = JSON.parse(await this.cluster.get(key))

            if (clientData) {
                // Filter out the entry with the given id
                clientData = clientData?.filter(item => item?.clientId !== clientId)
                // Save the updated array back to Redis
                await this.cluster.set(key, JSON.stringify(clientData));
            }
        } catch (error) {
            throw new InternalServerErrorException(error)
        }

    }

    async getWebSocketClientData(userId: number): Promise<any> {
        try {
            const key = REDIS_CACHE_KEY?.USER?.WEB_SOCKET_CLIENT_KEY_PREFIX;
            const getDataFromRedis = JSON.parse(await this.cluster.get(key));
            return getDataFromRedis?.find(item => item?.userId === userId);

        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
}