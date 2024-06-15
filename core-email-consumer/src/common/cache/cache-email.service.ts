import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { IDeviceToken } from 'src/interface/base.response.interface';
import { REDIS_CACHE_KEY } from '../constant/redis-key.constant';
import { InjectCluster } from '@liaoliaots/nestjs-redis';
import { Cluster } from 'ioredis';
import 'dotenv/config';


@Injectable()
export class CacheEmailService {
    constructor(
        @InjectCluster() private readonly cluster: Cluster,
    ) { }


    async checkUniqueIdentifierAndTokenIssueFromSameUser(userUniqueIdentifier: string, userId: number, userToken: string): Promise<boolean> {
        try {
            let getProfileObject;

            getProfileObject = JSON.parse(await this.cluster.get(`${REDIS_CACHE_KEY?.USER.ADD_CONSUMER_PROFILE_KEY_PREFIX}_${userId}`));

            if (!getProfileObject) return false

            const isDeviceTokenExist: IDeviceToken = getProfileObject[0]?.devicesToken?.find(tokenObj => tokenObj?.UniqueIdentifier === userUniqueIdentifier);

            if (!isDeviceTokenExist) return false
            if (isDeviceTokenExist?.authToken.length === 0) return false
            if (isDeviceTokenExist?.authToken == null || undefined) return false
            if (isDeviceTokenExist?.UniqueIdentifier !== userUniqueIdentifier) return false
            if (userToken !== isDeviceTokenExist?.authToken) throw new UnauthorizedException()

            return true
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

    async removeKeyFromRedis(key: string) {
        try {
            return await this.cluster.del(key)
        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
    async getValueToRedis(key: string) {
        try {
            return await this.cluster.get(key)
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
}