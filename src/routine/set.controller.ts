import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { SetService } from './set.service';

@Controller('set')
export class SetController {
  constructor(private readonly setService: SetService) {}

  @Post(':exerciseId')
  create(
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() data: any,
  ) {
    return this.setService.create(exerciseId, data);
  }

  @Get('exercise/:exerciseId')
  findAll(@Param('exerciseId', ParseIntPipe) exerciseId: number) {
    return this.setService.findAll(exerciseId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.setService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.setService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.setService.remove(id);
  }
}
