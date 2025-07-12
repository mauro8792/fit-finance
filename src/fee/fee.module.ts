import { Module } from '@nestjs/common';
import { FeeService } from './fee.service';
import { FeeController } from './fee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fee } from './entities/fee.entity';
import { Student } from 'src/student/entities/student.entity';
import { StudentModule } from 'src/student/student.module';
import { AuthModule } from 'src/auth/auth.module';

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
