import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { EmailEntity } from "../entities/email.entity";

@Injectable()
export class SyncDataMapper {

    syncEmailDataObj(data: any, header: any): EmailEntity {
        try {
            const syncData = new EmailEntity();
            syncData.emailId = data.id;
            syncData.hasAttachments = data.hasAttachments;
            syncData.body = data.bodyPreview;
            syncData.importance = data.importance;
            syncData.read = data.isRead;
            syncData.receivedDateTime = data.receivedDateTime;
            syncData.recipient = header.email;
            syncData.sender = data.sender.emailAddress.address;
            syncData.subject = data.subject;
            syncData.userId = header.userId;
            syncData.userName = header.userName
            return syncData

        } catch (error) {
            throw new InternalServerErrorException()
        }
    }

    updateEmailDataObj(newUpdateObject: any, oldUpdateObject: any): EmailEntity {
        try {
            const syncData = new EmailEntity();
            syncData.read = newUpdateObject?.isRead === oldUpdateObject?.isRead ? oldUpdateObject?.isRead : newUpdateObject?.isRead;
            return syncData

        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}