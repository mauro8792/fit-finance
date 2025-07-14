import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Payment } from './entities/payment.entity';
import { Fee } from '../fee/entities/fee.entity';
import { FeeModule } from '../fee/fee.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [
    TypeOrmModule.forFeature([Student, Payment, Fee]),
    FeeModule
  ],
  exports: [PaymentService]
})
export class PaymentModule {}

