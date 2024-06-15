import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'email' })
export class EmailEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "email_id" })
    emailId: string;

    @Column({ name: "user_id" })
    userId: number;

    @Column({ name: "user_name" })
    userName: string;

    @Column({ name: "sender" })
    sender: string;

    @Column({ name: "recipent" })
    recipient: string;

    @Column({ name: "subject" })
    subject: string;

    @Column({ name: "body", type: 'text' })
    body: string;

    @Column({ name: "importance", })
    importance: string;

    @Column({ name: "received_date_time", type: 'timestamp' })
    receivedDateTime: string;


    @Column({ name: "time_stamp", type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timeStamp: Date;

    @Column({ name: "read", default: false })
    read: boolean;

    @Column({ name: "has_attachments", default: false })
    hasAttachments: boolean;
}
