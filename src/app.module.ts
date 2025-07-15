import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { SeedModule } from './seed/seed.module';
import { StudentModule } from './student/student.module';
import { FeeModule } from './fee/fee.module';
import { PaymentModule } from './payment/payment.module';
import { SportModule } from './sport/sport.module';
import { CronModule } from './cron/cron.module';
import { MercadoPagoModule } from './mercadopago/mercadopago.module';
import { TestModule } from './test/test.module';
import { CoachModule } from './coach/coach.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DB_HOST?.includes('neon.tech') || process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
    }),
     ScheduleModule.forRoot(),

    UsersModule,
    CoachModule,

    CommonModule,

    AuthModule,

    RolesModule,

    SeedModule,

    StudentModule,

    FeeModule,

    PaymentModule,

    SportModule,

    CronModule,

    MercadoPagoModule,

    TestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
