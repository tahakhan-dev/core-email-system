import { InterServiceAxiosResponse } from "src/interface/filter.error.response.interface";
import { EMAIL_ENVIRONMENT } from "../constant/email-cred.constant";
import { CacheEmailService } from "../cache/cache-email.service";
import { REDIS_CACHE_KEY } from "../constant/redis-key.constant";
import { StatusCodes } from "../enums/status-codes.enum";
import { Inject, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class InterServices {
    constructor(
        private readonly httpService: HttpService,
        @Inject(CacheEmailService) private readonly cacheEmailService: CacheEmailService,
    ) { }

    async getRefreshToken(refreshToken: string, userId?: number): Promise<InterServiceAxiosResponse> {
        try {
            if (!refreshToken) return { error: true, result: StatusCodes.BAD_GATEWAY, message: "No referest token found " };

            const endpoint = `${EMAIL_ENVIRONMENT.LOCAL_APP.REFRESH_TOKEN_URL}=${refreshToken}`;

            const response: any = await firstValueFrom(this.httpService.get(endpoint, { timeout: 10000 }));

            if (response?.data?.status === 1) {

                await this.cacheEmailService.addValueToRedis(
                    `${REDIS_CACHE_KEY?.USER.ADD_USER_ACCESS_REFRESH_TOKEN}_${userId}`,
                    { accessToken: response?.data?.result?.access_token, refreshToken: response?.data?.result?.refresh_token }
                );
                return { error: false, result: response?.data?.result, message: "Success" };
            }

            return { error: true, result: response?.data?.statusCode, message: "unexpected Error Occur" };

        } catch (error) {
            return { error: true, message: `Failed to fetch transaction against budget. Reason: ${error.message || error}` };
        }
    }


}