  
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
import { FeeService } from './fee.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('fees')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Post()
  create(@Body() createFeeDto: CreateFeeDto) {
    return this.feeService.create(createFeeDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.feeService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.feeService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    return this.feeService.update(+id, updateFeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feeService.remove(+id);
  }
}
