import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SportService } from './sport.service';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('sports')
export class SportController {
  constructor(private readonly sportService: SportService) {}

  @Post()
  create(@Body() createSportDto: CreateSportDto) {
    return this.sportService.create(createSportDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.sportService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSportDto: UpdateSportDto) {
    return this.sportService.update(+id, updateSportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sportService.remove(+id);
  }
}
