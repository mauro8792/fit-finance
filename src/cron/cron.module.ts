import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { Student } from '../student/entities/student.entity';
import { Fee } from '../fee/entities/fee.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Student, Fee]),
  ],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
