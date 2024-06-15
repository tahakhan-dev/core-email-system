
import { CacheEmailService } from 'src/common/cache/cache-email.service';
import { JwtStrategy } from './guards/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: async () => ({
                signOptions: { expiresIn: '3d' }
            })
        }),
        PassportModule
    ],
    providers: [
        AuthService, JwtStrategy, CacheEmailService
    ],
    exports: [AuthService]
})
export class AuthModule { }
