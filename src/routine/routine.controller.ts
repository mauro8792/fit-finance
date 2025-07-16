import { Controller, Post, Param, Get, Delete, ParseIntPipe } from '@nestjs/common';
import { RoutineService } from './routine.service';

@Controller('routine')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  // Asignar rutina a usuario
  @Post('assign/:userId/:macrocycleId')
  assignRoutine(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('macrocycleId', ParseIntPipe) macrocycleId: number,
  ) {
    return this.routineService.assignRoutine(userId, macrocycleId);
  }

  // Obtener rutinas asignadas a un usuario
  @Get('assigned/:userId')
  getAssignedRoutines(@Param('userId', ParseIntPipe) userId: number) {
    return this.routineService.getAssignedRoutines(userId);
  }

  // Desasignar rutina
  @Delete('assigned/:assignedRoutineId')
  unassignRoutine(@Param('assignedRoutineId', ParseIntPipe) assignedRoutineId: number) {
    return this.routineService.unassignRoutine(assignedRoutineId);
  }
}
