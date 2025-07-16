import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { MesocycleService } from './mesocycle.service';

@Controller('mesocycle')
export class MesocycleController {
  constructor(private readonly mesocycleService: MesocycleService) {}

  @Post(':macrocycleId')
  create(
    @Param('macrocycleId', ParseIntPipe) macrocycleId: number,
    @Body() data: any,
  ) {
    return this.mesocycleService.create(macrocycleId, data);
  }

  @Get('macrocycle/:macrocycleId')
  findAll(@Param('macrocycleId', ParseIntPipe) macrocycleId: number) {
    return this.mesocycleService.findAll(macrocycleId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mesocycleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.mesocycleService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mesocycleService.remove(id);
  }
}
