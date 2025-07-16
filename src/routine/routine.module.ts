import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Macrocycle } from './macrocycle.entity';
import { Mesocycle } from './mesocycle.entity';
import { Microcycle } from './microcycle.entity';
import { Day } from './day.entity';
import { Exercise } from './exercise.entity';
import { SetEntity } from './set.entity';
import { AssignedRoutine } from './assigned-routine.entity';
import { RoutineService } from './routine.service';
import { RoutineController } from './routine.controller';
import { UsersModule } from '../users/users.module';
import { MacrocycleService } from './macrocycle.service';
import { MacrocycleController } from './macrocycle.controller';
import { MesocycleService } from './mesocycle.service';
import { MesocycleController } from './mesocycle.controller';
import { MicrocycleService } from './microcycle.service';
import { MicrocycleController } from './microcycle.controller';
import { DayService } from './day.service';
import { DayController } from './day.controller';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { SetService } from './set.service';
import { SetController } from './set.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Macrocycle,
      Mesocycle,
      Microcycle,
      Day,
      Exercise,
      SetEntity,
      AssignedRoutine,
    ]),
    UsersModule,
  ],
  controllers: [RoutineController, MacrocycleController, MesocycleController, MicrocycleController, DayController, ExerciseController, SetController],
  providers: [RoutineService, MacrocycleService, MesocycleService, MicrocycleService, DayService, ExerciseService, SetService],
  exports: [TypeOrmModule],
})
export class RoutineModule {}
