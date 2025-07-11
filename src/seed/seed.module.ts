import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { RolesModule } from 'src/roles/roles.module';
import { AuthModule } from 'src/auth/auth.module';
import { StudentModule } from 'src/student/student.module';
import { Role } from 'src/roles/entities/rol.entity';
import { User } from 'src/auth/entities/user.entity';
import { Sport } from 'src/sport/entities/sport.entity';
import { Student } from 'src/student/entities/student.entity';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([Role, User, Sport, Student]),
    RolesModule, 
    AuthModule,
    StudentModule
  ],
})
export class SeedModule {}
