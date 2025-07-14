import { Module } from '@nestjs/common';
import { FeeService } from './fee.service';
import { FeeController } from './fee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fee } from './entities/fee.entity';
import { Student } from '../student/entities/student.entity';
import { StudentModule } from '../student/student.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [FeeController],
  providers: [FeeService],
  imports: [
    TypeOrmModule.forFeature([Fee, Student]),
    AuthModule
  ],
  exports: [FeeService]
})
export class FeeModule {}

