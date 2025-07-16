import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';
import { StudentModule } from '../student/student.module';
import { Role } from '../roles/entities/rol.entity';
import { User } from '../auth/entities/user.entity';
import { Sport } from '../sport/entities/sport.entity';
import { Student } from '../student/entities/student.entity';
import { CoachModule } from '../coach/coach.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([Role, User, Sport, Student]),
    RolesModule, 
    AuthModule,
    StudentModule,
    CoachModule
  ],
})
export class SeedModule {}

