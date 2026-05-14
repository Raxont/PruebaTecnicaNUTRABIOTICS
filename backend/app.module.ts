import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { AdminModule } from './admin/admin.module';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate Limiting: 100 requests per 15 minutes per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,        // 1 minuto
        limit: 100,        // 100 requests por minuto
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    DoctorsModule,
    PatientsModule,
    PrescriptionsModule,
    AdminModule,
    MeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
