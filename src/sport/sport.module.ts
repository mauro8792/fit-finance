import { Module } from '@nestjs/common';
import { SportService } from './sport.service';
import { SportController } from './sport.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sport } from './entities/sport.entity';

@Module({
  controllers: [SportController],
  providers: [SportService],
  imports:[TypeOrmModule.forFeature([Sport])]
})
export class SportModule {}
