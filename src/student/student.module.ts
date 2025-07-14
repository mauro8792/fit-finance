import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student } from './entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fee } from '../fee/entities/fee.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Sport } from '../sport/entities/sport.entity';
import { FeeModule } from '../fee/fee.module';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [TypeOrmModule.forFeature([Student, Fee, Payment, Sport]), FeeModule],
  exports: [StudentService],
})
export class StudentModule {}
