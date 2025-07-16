import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { DayService } from './day.service';

@Controller('day')
export class DayController {
  constructor(private readonly dayService: DayService) {}

  @Post(':microcycleId')
  create(
    @Param('microcycleId', ParseIntPipe) microcycleId: number,
    @Body() data: any,
  ) {
    return this.dayService.create(microcycleId, data);
  }

  @Get('microcycle/:microcycleId')
  findAll(@Param('microcycleId', ParseIntPipe) microcycleId: number) {
    return this.dayService.findAll(microcycleId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dayService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.dayService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dayService.remove(id);
  }
}
