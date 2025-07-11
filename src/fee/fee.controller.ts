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

  @Get('student/:studentId/unpaid')
  async getUnpaidFeesByStudent(@Param('studentId') studentId: string) {
    const unpaidFees = await this.feeService.getUnpaidFeesByStudent(+studentId);
    return {
      studentId: +studentId,
      unpaidFeesCount: unpaidFees.length,
      unpaidFees: unpaidFees.map(fee => ({
        id: fee.id,
        month: fee.month,
        year: fee.year,
        monthName: this.getMonthName(fee.month),
        value: fee.value,
        amountPaid: fee.amountPaid,
        remainingAmount: fee.value - fee.amountPaid,
        startDate: fee.startDate,
        endDate: fee.endDate
      }))
    };
  }

  @Get('student/:studentId/validate-payment/:feeId')
  async validatePayment(
    @Param('studentId') studentId: string,
    @Param('feeId') feeId: string
  ) {
    return await this.feeService.validateSequentialPayment(+studentId, +feeId);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.feeService.findOne(term);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    return this.feeService.update(+id, updateFeeDto);
  }

  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feeService.remove(+id);
  }
}
