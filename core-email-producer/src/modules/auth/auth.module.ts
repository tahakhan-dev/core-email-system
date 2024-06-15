
import { CacheUserService } from 'src/common/cache/cache-user.service';
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
        AuthService, JwtStrategy, CacheUserService
    ],
    exports: [AuthService]
})
export class AuthModule { }
