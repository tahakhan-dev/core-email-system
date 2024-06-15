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
            syncData.emailId = newUpdateObject?.id === oldUpdateObject?.id ? oldUpdateObject?.id : newUpdateObject?.id;
            syncData.hasAttachments = newUpdateObject?.hasAttachments === oldUpdateObject?.hasAttachments ? oldUpdateObject?.hasAttachments : newUpdateObject?.hasAttachments;
            syncData.body = newUpdateObject?.bodyPreview === oldUpdateObject?.bodyPreview ? oldUpdateObject?.bodyPreview : newUpdateObject?.bodyPreview;
            syncData.importance = newUpdateObject?.importance === oldUpdateObject?.importance ? oldUpdateObject?.importance : newUpdateObject?.importance;
            syncData.read = newUpdateObject?.isRead === oldUpdateObject?.isRead ? oldUpdateObject?.isRead : newUpdateObject?.isRead;
            syncData.receivedDateTime = newUpdateObject?.receivedDateTime === oldUpdateObject?.receivedDateTime ? oldUpdateObject?.receivedDateTime : newUpdateObject?.receivedDateTime;
            syncData.recipient = newUpdateObject?.email === oldUpdateObject?.email ? oldUpdateObject?.email : newUpdateObject?.email;
            syncData.sender = newUpdateObject?.sender?.emailAddress?.address === oldUpdateObject?.sender?.emailAddress?.address ? oldUpdateObject?.sender?.emailAddress?.address : newUpdateObject?.sender?.emailAddress?.address;
            syncData.subject = newUpdateObject?.subject === oldUpdateObject?.subject ? oldUpdateObject?.subject : newUpdateObject?.subject;
            return syncData

        } catch (error) {
            throw new InternalServerErrorException()
        }
    }
}