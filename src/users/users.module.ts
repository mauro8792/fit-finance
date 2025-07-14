import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserTest } from './entities/user.entity';
import { User } from '../auth/entities/user.entity';


@Module({
  controllers: [UsersController],
  providers: [UsersService, ],
  imports: [
    
    TypeOrmModule.forFeature([User]),
    
  ],
  exports: [TypeOrmModule],
})
export class UsersModule {}
