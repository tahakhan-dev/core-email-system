import { IDecryptWrapper, IEmailResponse } from "src/interface/base.response.interface";
import { EmailSubscription } from "src/common/helper/email-subscription.helper";
import { InterServices } from "src/common/inter-services/inter-service.service";
import { TokenFunctions } from "src/common/functions/token-generic-function";
import { responseHandler } from "src/common/helper/response-handler.helper";
import { Status, SubscriptionStatus } from "src/common/enums/status.enum";
import { CacheEmailService } from "src/common/cache/cache-email.service";
import { REDIS_CACHE_KEY } from "src/common/constant/redis-key.constant";
import { StatusCodes } from "src/common/enums/status-codes.enum";
import { EmailEntity } from "./entities/email.entity";
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request } from 'express';

@Injectable()
export class EmailRepository {
    constructor(
        // repositories
        @InjectRepository(EmailEntity) private emailRepository: Repository<EmailEntity>,

        // Functions
        @Inject(TokenFunctions) private readonly tokenFunctionsService: TokenFunctions,

        // services and helpers
        @Inject(InterServices) private readonly interServices: InterServices,
        @Inject(CacheEmailService) private readonly cacheEmailService: CacheEmailService,
        @Inject(EmailSubscription) private readonly emailSubscriptionHelper: EmailSubscription,
    ) { }


    async emailSubscription(request?: Request, status?: SubscriptionStatus | any, userId?: number): Promise<any> {
        return await this.userEmailSubscription(request, status, userId);
    }

    async createEmailSubscriptionCron(): Promise<any> {
        return await this.createUserEmailSubscriptionCron();
    }
    async createEmail(request: Request, createEmailBody: any): Promise<any> {
        return await this.createUserEmail(request, createEmailBody);
    }

    async updateEmail(request: Request, updateEmailBody: any): Promise<any> {
        return await this.updateUserEmail(request, updateEmailBody);
    }

    async deleteEmail(request: Request, deleteEmailBody: any): Promise<any> {
        return await this.deleteUserEmail(request, deleteEmailBody);
    }

    async getAllUserEmail(request: Request): Promise<any> {
        return await this.getAllConsumerEmail(request);
    }

    async getUserEmailById(request: Request, id: number): Promise<any> {
        return await this.getConsumerEmailById(request, id);
    }

    // =============== POST REQUESTS ===================

    private async userEmailSubscription(request?: Request, status?: SubscriptionStatus, userId?: number): Promise<IEmailResponse> {
        let response: IEmailResponse, decryptResponse: IDecryptWrapper;
        try {

            if (!userId) {
                decryptResponse = this.tokenFunctionsService.decryptUserToken(request); // decrypting consumer token
            }

            let getValueFromRedis = await this.cacheEmailService.getValueToRedis(`${REDIS_CACHE_KEY?.USER.ADD_USER_ACCESS_REFRESH_TOKEN}_${userId ?? decryptResponse.id}`);

            if (!getValueFromRedis) responseHandler(null, "Unauthorized", Status.FAILED, StatusCodes.UNAUTHORIZED)
            let parseValueFromRedis = JSON.parse(getValueFromRedis);

            let getAccessTokenResponse = await this.interServices.getRefreshToken(parseValueFromRedis?.refreshToken, userId ?? decryptResponse?.id);

            if (getAccessTokenResponse.error) return responseHandler(null, getAccessTokenResponse.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR);

            await this.emailSubscriptionHelper.createSubscription(getAccessTokenResponse?.result?.access_token, userId ?? decryptResponse.id, status);

            response = responseHandler(null, `User Email Subscription Created`, Status.SUCCESS, StatusCodes.SUCCESS) // sending response to client

        } catch (error) {
            response = responseHandler(null, error, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return response
    }

    private async createUserEmail(request: Request, createEmailBody: any): Promise<any> {
        let response: IEmailResponse, newEmailIds = [];
        try {
            let getValueFromRedis = await this.cacheEmailService.getValueToRedis(`${REDIS_CACHE_KEY?.USER.ADD_USER_ACCESS_REFRESH_TOKEN}_${+createEmailBody?.value[0]?.clientState}`);
            let parseValueFromRedis = JSON.parse(getValueFromRedis);

            if (!parseValueFromRedis) return responseHandler(null, `There is some issue with access token`, Status.FAILED, StatusCodes.UNAUTHORIZED);

            createEmailBody?.value?.forEach(element => {
                newEmailIds.push({ id: JSON.parse(element?.clientState), emailId: element?.resourceData?.id, accessToken: parseValueFromRedis?.accessToken })
            });

            response = responseHandler(newEmailIds, `User Email Create`, Status.SUCCESS, StatusCodes.SUCCESS) // sending response to client

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return response

    }

    private async updateUserEmail(request: Request, updateEmailBody: any): Promise<any> {
        let response: IEmailResponse, updateEmailIds = [];
        try {
            let getValueFromRedis = await this.cacheEmailService.getValueToRedis(`${REDIS_CACHE_KEY?.USER.ADD_USER_ACCESS_REFRESH_TOKEN}_${+updateEmailBody?.value[0]?.clientState}`);
            let parseValueFromRedis = JSON.parse(getValueFromRedis);

            if (!parseValueFromRedis) return responseHandler(null, `There is some issue with access token`, Status.FAILED, StatusCodes.UNAUTHORIZED)


            updateEmailBody?.value?.forEach(element => {
                updateEmailIds.push({ id: JSON.parse(element?.clientState), emailId: element?.resourceData?.id, accessToken: parseValueFromRedis?.accessToken })
            });

            response = responseHandler(updateEmailIds, `User Email Update`, Status.SUCCESS, StatusCodes.SUCCESS) // sending response to client

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return response

    }

    private async deleteUserEmail(request: Request, deleteEmailBody: any): Promise<IEmailResponse> {
        let response: IEmailResponse;
        try {
            response = responseHandler(null, `User Email Delete`, Status.SUCCESS, StatusCodes.SUCCESS) // sending response to client
        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return response

    }

    private async createUserEmailSubscriptionCron() {
        let response: IEmailResponse;
        try {
            const result = await this.emailRepository.query('SELECT user_id FROM email GROUP BY user_id');
            const mapResult = result.map(row => row.user_id);

            response = responseHandler(mapResult, "Users List", Status.SUCCESS, StatusCodes.SUCCESS)

        } catch (error) {
            response = responseHandler(null, error, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)

        }
        return response

    }

    // ========================= GET REQUESTS =========================

    private async getConsumerEmailById(request: Request, id: number): Promise<IEmailResponse> {
        let response: IEmailResponse, getConsumerEmailById: EmailEntity[];

        try {

            getConsumerEmailById = await this.emailRepository.find({ where: { id } })

            if (!getConsumerEmailById) return responseHandler(null, "There is no email", Status.SUCCESS, StatusCodes.SUCCESS)

            response = responseHandler(getConsumerEmailById, `User Email`, Status.SUCCESS, StatusCodes.SUCCESS) // sending response to client

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }

        return response
    }

    private async getAllConsumerEmail(request: Request): Promise<IEmailResponse> {
        let response: IEmailResponse, decryptResponse: IDecryptWrapper, getAllUserEmail: EmailEntity[];

        try {
            decryptResponse = this.tokenFunctionsService.decryptUserToken(request); // decrypting consumer token
            const userId = decryptResponse.id;

            getAllUserEmail = await this.emailRepository.find({
                where: { userId },
                cache: {
                    id: `${REDIS_CACHE_KEY?.EMAIL.GET_USER_EMAIL_BY_ID}_${userId}`,
                    milliseconds: REDIS_CACHE_KEY?.milliseconds
                }
            })

            if (!getAllUserEmail) return responseHandler(null, "There is no email", Status.SUCCESS, StatusCodes.SUCCESS)

            response = responseHandler(getAllUserEmail, `User Email`, Status.SUCCESS, StatusCodes.SUCCESS) // sending response to client

        } catch (error) {
            response = responseHandler(null, error.message, Status.FAILED, StatusCodes.INTERNAL_SERVER_ERROR)
        }

        return response
    }

}