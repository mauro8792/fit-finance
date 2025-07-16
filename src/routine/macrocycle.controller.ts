import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { MacrocycleService } from './macrocycle.service';

@Controller('macrocycle')
export class MacrocycleController {
  constructor(private readonly macrocycleService: MacrocycleService) {}

  @Post()
  create(@Body() data: any) {
    return this.macrocycleService.create(data);
  }

  @Get()
  findAll() {
    return this.macrocycleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.macrocycleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.macrocycleService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.macrocycleService.remove(id);
  }
}
