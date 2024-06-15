import { IDeviceToken } from 'src/interface/base.response.interface';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_name", unique: true })
  userName: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: "email", unique: true })
  email: string;

  @Column({ name: "created_at", type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: "last_login", type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ name: 'oAuth_email_token', nullable: true })
  oAuthEmailToken: string;

  @Column({ name: 'oAuth_email_refresh_token', nullable: true })
  oAuthEmailRefreshToken: string;

  @Column({ name: 'oAuth_expires_in', nullable: true })
  oAuthExpiresIn: number;

  @Column({ name: 'oAuth_ext_expires_in', nullable: true })
  oAuthExtExpiresIn: number;

  @Column({ name: 'token_secret_key', nullable: true })
  tokenSecretKey: string;

  @Column({ name: "email_connected", default: false })
  emailConnected: boolean;

  @Column({ name: "is_email_sync", default: false })
  isEmailSync: boolean;

  authToken: string;
  devicesToken: IDeviceToken[];
}
