import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthModuleController } from './auth.controller';
import { UserModule } from 'src/user-module/user.module';
import { JwtModule } from '@nestjs/jwt';
//import { jwtConstants } from './constants/constants';
import { AuthGuard } from './guard/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResendEmailService } from 'src/resend-email/resend-email.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
        global: true,
      }),
      inject: [ConfigService],
    }),
    // JwtModule.register({
    //   global: true,
    //   secret: jwtConstants.secret,
    //   signOptions: { expiresIn: '1h' },
    // }),
  ],
  controllers: [AuthModuleController],
  providers: [AuthService, AuthGuard, ResendEmailService],
  exports: [AuthGuard, AuthService, JwtModule],
})
export class AuthModule {}
