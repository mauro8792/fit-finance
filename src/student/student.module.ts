import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student } from './entities/student.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fee } from 'src/fee/entities/fee.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { Sport } from 'src/sport/entities/sport.entity';
import { FeeModule } from 'src/fee/fee.module';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [TypeOrmModule.forFeature([Student, Fee, Payment, Sport]), FeeModule],
  exports: [StudentService],
})
export class StudentModule {}
