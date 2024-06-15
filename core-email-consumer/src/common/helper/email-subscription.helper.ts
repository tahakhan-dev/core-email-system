import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EMAIL_ENVIRONMENT } from '../constant/email-cred.constant';
import { SubscriptionStatus } from '../enums/status.enum';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';


@Injectable()
export class EmailSubscription {  // class related to token 
    constructor(
        private httpService: HttpService,
    ) { }

    async createSubscription(token: string, userId: number, status: SubscriptionStatus) {
        try {
            const accessToken = token; // Obtain this token using OAuth2
        
            if (!accessToken || !userId) throw new InternalServerErrorException("There is some issue please try again later")

            const subscriptionRequest = {
                changeType: status,
                notificationUrl: `${EMAIL_ENVIRONMENT.LOCAL_APP.NGROK_URL}/api/email/${status}`,
                resource: EMAIL_ENVIRONMENT.MSURL.EMAIL_RESOURCE,
                expirationDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiration
                clientState: JSON.stringify(+userId),
            };
            const response: any = await lastValueFrom(
                this.httpService.post(EMAIL_ENVIRONMENT.MSURL.EMAIL_SUBSCRIPTION_URL, subscriptionRequest, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000 // Increase timeout to 10 seconds
                }),
            );
            return response.data;
        } catch (error) {
            console.log(error.response.data, '===========error.response.data=============');
            throw new InternalServerErrorException(error.response.data)
        }
    }

    async getNewEmailBySubscription(emailId: string, accessToken: string) {
        try {
            if (!accessToken || !emailId) throw new InternalServerErrorException("There is some issue please try again later")

            const response: any = await firstValueFrom(
                this.httpService.get(`${EMAIL_ENVIRONMENT.MSURL.GET_EMAIL_BY_ID}${emailId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000 // Increase timeout to 10 seconds
                }),
            );
            console.log(response.data,'=====response.data update==============');

            return response.data;
        } catch (error) {
            throw new InternalServerErrorException(error.response.data)
        }
    }
}

