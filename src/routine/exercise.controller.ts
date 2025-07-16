import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post(':dayId')
  create(
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() data: any,
  ) {
    return this.exerciseService.create(dayId, data);
  }

  @Get('day/:dayId')
  findAll(@Param('dayId', ParseIntPipe) dayId: number) {
    return this.exerciseService.findAll(dayId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.exerciseService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.remove(id);
  }
}
